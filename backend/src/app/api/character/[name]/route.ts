import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, TibiaCharacterLookupDto } from '@shared/api-contract';
import { CharacterNameParamSchema } from '@shared/api-schemas';
import { errorResponse } from '@/lib/api-response';
import { parseRouteParams } from '@/lib/request-validation';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import {
  CharacterLookupStorageError,
  findLatestCharacterLookup,
  lookupCharacter,
  type CharacterLookupStorageStage,
} from '@/lib/character-lookup-service';
import { ErrorCode } from '@/lib/errors';
import { HttpStatus } from '@/lib/http-status';
import { logError } from '@/lib/logger';
import { TibiaDataNotFoundError } from '@/lib/tibiadata';

export const dynamic = 'force-dynamic';

const STORAGE_FAILURES: Record<CharacterLookupStorageStage, { scope: string; message: string }> = {
  save: {
    scope: 'character.saveLookup',
    message: 'Could not save character lookup history',
  },
  history: {
    scope: 'character.lookupHistory',
    message: 'Could not load character lookup history',
  },
};

interface RouteParams extends Record<string, string | undefined> {
  name: string;
}

function lookupResponse(lookup: TibiaCharacterLookupDto): NextResponse {
  return NextResponse.json<ApiResponse<TibiaCharacterLookupDto>>({ data: lookup });
}

function storageErrorResponse(error: CharacterLookupStorageError, name: string): NextResponse {
  const failure = STORAGE_FAILURES[error.stage];
  logError(failure.scope, ErrorCode.DB_QUERY_FAILED, { name }, error.cause);
  return errorResponse(
    failure.message,
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCode.DB_QUERY_FAILED,
  );
}

async function respondWithCachedCharacter(characterName: string): Promise<NextResponse | null> {
  try {
    const cachedLookup = await findLatestCharacterLookup(characterName);
    return cachedLookup ? lookupResponse(cachedLookup) : null;
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
    return lookupResponse(await lookupCharacter(characterName, auth.session.sub));
  } catch (error) {
    if (error instanceof CharacterLookupStorageError) {
      return storageErrorResponse(error, characterName);
    }

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
