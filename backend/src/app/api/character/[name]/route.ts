import { NextResponse, type NextRequest } from 'next/server';
import type {
  ApiResponse,
  TibiaCharacterDto,
  TibiaCharacterHistoryEntryDto,
  TibiaCharacterLookupDto,
} from '@shared/api-contract';
import { CharacterNameParamSchema } from '@shared/api-schemas';
import { errorResponse } from '@/lib/api-response';
import { parseRouteParams } from '@/lib/request-validation';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import {
  getFreshCharacterSnapshot,
  getLatestCharacterSnapshot,
  listCharacterLookupHistory,
  saveCharacterLookup,
} from '@/lib/character-lookups';
import { ErrorCode } from '@/lib/errors';
import { HttpStatus } from '@/lib/http-status';
import { logError } from '@/lib/logger';
import { fetchCharacter, TibiaDataNotFoundError } from '@/lib/tibiadata';

export const dynamic = 'force-dynamic';

const DEFAULT_SNAPSHOT_TTL_MINUTES = 15;
const SECONDS_PER_MINUTE = 60;

function getSnapshotTtlSeconds(): number {
  const raw = process.env.CHARACTER_SNAPSHOT_TTL_MINUTES?.trim();
  const ttlMinutes = raw ? Number(raw) : Number.NaN;
  if (!Number.isFinite(ttlMinutes) || ttlMinutes < 0) {
    return DEFAULT_SNAPSHOT_TTL_MINUTES * SECONDS_PER_MINUTE;
  }
  return Math.floor(ttlMinutes * SECONDS_PER_MINUTE);
}

interface RouteParams extends Record<string, string | undefined> {
  name: string;
}

function lookupResponse(
  character: TibiaCharacterDto,
  history: TibiaCharacterHistoryEntryDto[],
): NextResponse {
  return NextResponse.json<ApiResponse<TibiaCharacterLookupDto>>({
    data: { character, history },
  });
}

async function respondWithFreshSnapshot(characterName: string): Promise<NextResponse | null> {
  const snapshotTtlSeconds = getSnapshotTtlSeconds();
  if (snapshotTtlSeconds <= 0) {
    return null;
  }

  const freshSnapshot = await getFreshCharacterSnapshot(characterName, snapshotTtlSeconds);
  if (!freshSnapshot) {
    return null;
  }

  return lookupResponse(freshSnapshot, await listCharacterLookupHistory(characterName));
}

async function respondWithLiveCharacter(
  characterName: string,
  googleId: string,
): Promise<NextResponse> {
  const character = await fetchCharacter(characterName);

  try {
    await saveCharacterLookup(character, characterName, googleId);
  } catch (error) {
    logError('character.saveLookup', ErrorCode.DB_QUERY_FAILED, { name: characterName }, error);
    return errorResponse(
      'Could not save character lookup history',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DB_QUERY_FAILED,
    );
  }

  let history: TibiaCharacterHistoryEntryDto[];
  try {
    history = await listCharacterLookupHistory(characterName);
  } catch (error) {
    logError('character.lookupHistory', ErrorCode.DB_QUERY_FAILED, { name: characterName }, error);
    return errorResponse(
      'Could not load character lookup history',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DB_QUERY_FAILED,
    );
  }

  return lookupResponse(character, history);
}

async function respondWithCachedCharacter(characterName: string): Promise<NextResponse | null> {
  try {
    const cachedCharacter = await getLatestCharacterSnapshot(characterName);
    if (!cachedCharacter) {
      return null;
    }

    return lookupResponse(cachedCharacter, await listCharacterLookupHistory(characterName));
  } catch (error) {
    logError('character.fallback', ErrorCode.DB_QUERY_FAILED, { name: characterName }, error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<RouteParams> },
): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const validation = parseRouteParams(await props.params, CharacterNameParamSchema, {
    scope: 'character.get',
  });
  if (!validation.ok) {
    return validation.response;
  }

  const characterName = validation.data.name;

  try {
    return (
      (await respondWithFreshSnapshot(characterName)) ??
      (await respondWithLiveCharacter(characterName, auth.session.sub))
    );
  } catch (error) {
    if (error instanceof TibiaDataNotFoundError) {
      return errorResponse('Character not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const cachedResponse = await respondWithCachedCharacter(characterName);
    if (cachedResponse) {
      return cachedResponse;
    }

    logError('character.get', ErrorCode.INTERNAL_ERROR, { name: characterName }, error);
    return errorResponse(
      'Could not load character details',
      HttpStatus.BAD_GATEWAY,
      ErrorCode.INTERNAL_ERROR,
    );
  }
}
