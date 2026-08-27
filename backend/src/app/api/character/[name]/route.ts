import { NextResponse, type NextRequest } from 'next/server';
import type {
  ApiResponse,
  TibiaCharacterHistoryEntryDto,
  TibiaCharacterLookupDto,
} from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import {
  getFreshCharacterSnapshot,
  getLatestCharacterSnapshot,
  listCharacterLookupHistory,
  saveCharacterLookup,
} from '@/lib/character-lookups';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';
import { fetchCharacter, TibiaDataNotFoundError } from '@/lib/tibiadata';

export const dynamic = 'force-dynamic';

const DEFAULT_SNAPSHOT_TTL_MINUTES = 15;
const SECONDS_PER_MINUTE = 60;

function getSnapshotTtlSeconds(): number {
  const raw = process.env.CHARACTER_SNAPSHOT_TTL_MINUTES?.trim();
  if (!raw) {
    return DEFAULT_SNAPSHOT_TTL_MINUTES * SECONDS_PER_MINUTE;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_SNAPSHOT_TTL_MINUTES * SECONDS_PER_MINUTE;
  }
  return Math.floor(parsed * SECONDS_PER_MINUTE);
}

interface RouteParams {
  name: string;
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<RouteParams> },
): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const params = await props.params;
  const characterName = decodeURIComponent(params.name ?? '').trim();

  if (!characterName) {
    return errorResponse('Character name is required', 400, ErrorCode.VALIDATION_FAILED);
  }

  try {
    const snapshotTtlSeconds = getSnapshotTtlSeconds();
    if (snapshotTtlSeconds > 0) {
      const freshSnapshot = await getFreshCharacterSnapshot(characterName, snapshotTtlSeconds);
      if (freshSnapshot) {
        const history = await listCharacterLookupHistory(characterName);
        const data: TibiaCharacterLookupDto = {
          character: freshSnapshot,
          history,
        };
        return NextResponse.json<ApiResponse<TibiaCharacterLookupDto>>({ data });
      }
    }

    const character = await fetchCharacter(characterName);

    try {
      await saveCharacterLookup(character, characterName, auth.session.sub);
    } catch (error) {
      logError('character.saveLookup', ErrorCode.DB_QUERY_FAILED, { name: characterName }, error);
      return errorResponse(
        'Could not save character lookup history',
        500,
        ErrorCode.DB_QUERY_FAILED,
      );
    }

    let history: TibiaCharacterHistoryEntryDto[];
    try {
      history = await listCharacterLookupHistory(characterName);
    } catch (error) {
      logError(
        'character.lookupHistory',
        ErrorCode.DB_QUERY_FAILED,
        { name: characterName },
        error,
      );
      return errorResponse(
        'Could not load character lookup history',
        500,
        ErrorCode.DB_QUERY_FAILED,
      );
    }

    const data: TibiaCharacterLookupDto = {
      character,
      history,
    };

    return NextResponse.json<ApiResponse<TibiaCharacterLookupDto>>({ data });
  } catch (error) {
    if (error instanceof TibiaDataNotFoundError) {
      return errorResponse('Character not found', 404, ErrorCode.NOT_FOUND);
    }

    try {
      const cachedCharacter = await getLatestCharacterSnapshot(characterName);
      if (cachedCharacter) {
        const history = await listCharacterLookupHistory(characterName);
        const data: TibiaCharacterLookupDto = {
          character: cachedCharacter,
          history,
        };
        return NextResponse.json<ApiResponse<TibiaCharacterLookupDto>>({ data });
      }
    } catch (fallbackError) {
      logError(
        'character.fallback',
        ErrorCode.DB_QUERY_FAILED,
        { name: characterName },
        fallbackError,
      );
    }

    logError('character.get', ErrorCode.INTERNAL_ERROR, { name: characterName }, error);
    return errorResponse('Could not load character details', 502, ErrorCode.INTERNAL_ERROR);
  }
}
