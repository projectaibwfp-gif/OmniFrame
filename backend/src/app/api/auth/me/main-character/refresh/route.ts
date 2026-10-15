import { NextResponse, type NextRequest } from 'next/server';
import type {
  ApiResponse,
  AuthCurrentUserDto,
  AuthCurrentUserResponseDto,
  TibiaCharacterDto,
} from '@shared/api-contract';
import { errorResponse, type RouteResult } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { HttpStatus } from '@/lib/http-status';
import { logError } from '@/lib/logger';
import { getCurrentUserProfile, setMainCharacterForUser } from '@/lib/profile';
import { fetchCharacter } from '@/lib/tibiadata';
import { tibiaDataErrorResponse } from '@/lib/tibiadata-api';

export const dynamic = 'force-dynamic';

async function loadLinkedCharacterName(googleId: string): Promise<RouteResult<string>> {
  let user: AuthCurrentUserDto | null;
  try {
    user = await getCurrentUserProfile(googleId);
  } catch (error) {
    logError('auth.mainCharacter.refresh.load', ErrorCode.DB_QUERY_FAILED, {}, error);
    return {
      ok: false,
      response: errorResponse(
        'Could not load current user',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.DB_QUERY_FAILED,
      ),
    };
  }

  if (user === null) {
    return {
      ok: false,
      response: errorResponse('Current user not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND),
    };
  }

  if (!user.mainCharacter?.name) {
    return {
      ok: false,
      response: errorResponse(
        'No main character linked',
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_FAILED,
      ),
    };
  }

  return { ok: true, data: user.mainCharacter.name };
}

async function fetchLinkedCharacter(
  characterName: string,
): Promise<RouteResult<TibiaCharacterDto>> {
  try {
    return { ok: true, data: await fetchCharacter(characterName) };
  } catch (error) {
    return {
      ok: false,
      response: tibiaDataErrorResponse(error, {
        scope: 'auth.mainCharacter.refresh.fetch',
        resource: 'Character',
        context: { name: characterName },
        messages: {
          notFound: 'Character not found on TibiaData',
          loadFailed: 'Could not refresh character from TibiaData',
        },
      }),
    };
  }
}

async function saveRefreshedCharacter(
  googleId: string,
  character: TibiaCharacterDto,
): Promise<NextResponse> {
  try {
    await setMainCharacterForUser({
      googleId,
      name: character.name,
      world: character.world,
      vocation: character.vocation,
      level: character.level,
    });

    const updatedUser = await getCurrentUserProfile(googleId);
    if (updatedUser === null) {
      return errorResponse('Current user not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    return NextResponse.json<ApiResponse<AuthCurrentUserResponseDto>>({
      data: { user: updatedUser },
    });
  } catch (error) {
    logError(
      'auth.mainCharacter.refresh.save',
      ErrorCode.DB_QUERY_FAILED,
      { name: character.name },
      error,
    );
    return errorResponse(
      'Could not refresh main character',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DB_QUERY_FAILED,
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const characterName = await loadLinkedCharacterName(auth.session.sub);
  if (!characterName.ok) {
    return characterName.response;
  }

  const character = await fetchLinkedCharacter(characterName.data);
  if (!character.ok) {
    return character.response;
  }

  return saveRefreshedCharacter(auth.session.sub, character.data);
}
