import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, AuthCurrentUserResponseDto } from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';
import { getCurrentUserProfile, setMainCharacterForUser } from '@/lib/profile';
import { fetchCharacter, TibiaDataNotFoundError } from '@/lib/tibiadata';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const user = await getCurrentUserProfile(auth.session.sub);
  if (user === null) {
    return errorResponse('Current user not found', 404, ErrorCode.NOT_FOUND);
  }

  if (!user.mainCharacter?.name) {
    return errorResponse('No main character linked', 400, ErrorCode.VALIDATION_FAILED);
  }

  const characterName = user.mainCharacter.name;

  let character;
  try {
    character = await fetchCharacter(characterName);
  } catch (error) {
    if (error instanceof TibiaDataNotFoundError) {
      return errorResponse('Character not found on TibiaData', 404, ErrorCode.NOT_FOUND);
    }
    logError(
      'auth.mainCharacter.refresh.fetch',
      ErrorCode.INTERNAL_ERROR,
      { name: characterName },
      error,
    );
    return errorResponse(
      'Could not refresh character from TibiaData',
      502,
      ErrorCode.INTERNAL_ERROR,
    );
  }

  try {
    await setMainCharacterForUser({
      googleId: auth.session.sub,
      name: character.name,
      world: character.world,
      vocation: character.vocation,
      level: character.level,
    });

    const updatedUser = await getCurrentUserProfile(auth.session.sub);
    if (updatedUser === null) {
      return errorResponse('Current user not found', 404, ErrorCode.NOT_FOUND);
    }

    return NextResponse.json<ApiResponse<AuthCurrentUserResponseDto>>({
      data: { user: updatedUser },
    });
  } catch (error) {
    logError(
      'auth.mainCharacter.refresh.save',
      ErrorCode.DB_QUERY_FAILED,
      { name: characterName },
      error,
    );
    return errorResponse('Could not refresh main character', 500, ErrorCode.DB_QUERY_FAILED);
  }
}
