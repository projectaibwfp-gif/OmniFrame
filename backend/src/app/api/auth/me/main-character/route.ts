import { NextResponse, type NextRequest } from 'next/server';
import type {
  ApiResponse,
  AuthCurrentUserResponseDto,
  TibiaCharacterDto,
} from '@shared/api-contract';
import { LinkMainCharacterRequestSchema } from '@shared/api-schemas';
import { errorResponse } from '@/lib/api-response';
import { parseJsonBody } from '@/lib/request-validation';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { HttpStatus } from '@/lib/http-status';
import { logError } from '@/lib/logger';
import {
  clearMainCharacterForUser,
  getCurrentUserProfile,
  setMainCharacterForUser,
} from '@/lib/profile';
import { fetchCharacter } from '@/lib/tibiadata';
import { tibiaDataErrorResponse } from '@/lib/tibiadata-api';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const validation = await parseJsonBody(request, LinkMainCharacterRequestSchema, {
    scope: 'auth.mainCharacter.link',
  });
  if (!validation.ok) {
    return validation.response;
  }

  const { name: characterName } = validation.data;

  let character: TibiaCharacterDto;
  try {
    character = await fetchCharacter(characterName);
  } catch (error) {
    return tibiaDataErrorResponse(error, {
      scope: 'auth.mainCharacter.fetch',
      resource: 'Character',
      context: { name: characterName },
      messages: { loadFailed: 'Could not verify character' },
    });
  }

  try {
    await setMainCharacterForUser({
      googleId: auth.session.sub,
      name: character.name,
      world: character.world,
      vocation: character.vocation,
      level: character.level,
    });

    const user = await getCurrentUserProfile(auth.session.sub);
    if (user === null) {
      return errorResponse('Current user not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    return NextResponse.json<ApiResponse<AuthCurrentUserResponseDto>>({ data: { user } });
  } catch (error) {
    logError('auth.mainCharacter.save', ErrorCode.DB_QUERY_FAILED, { name: characterName }, error);
    return errorResponse(
      'Could not link main character',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DB_QUERY_FAILED,
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  try {
    await clearMainCharacterForUser(auth.session.sub);

    const user = await getCurrentUserProfile(auth.session.sub);
    if (user === null) {
      return errorResponse('Current user not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    return NextResponse.json<ApiResponse<AuthCurrentUserResponseDto>>({ data: { user } });
  } catch (error) {
    logError('auth.mainCharacter.clear', ErrorCode.DB_QUERY_FAILED, {}, error);
    return errorResponse(
      'Could not unlink main character',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DB_QUERY_FAILED,
    );
  }
}
