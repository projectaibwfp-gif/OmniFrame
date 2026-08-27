import { NextResponse, type NextRequest } from 'next/server';
import type {
  ApiResponse,
  AuthCurrentUserResponseDto,
  LinkMainCharacterRequestDto,
  TibiaCharacterDto,
} from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';
import {
  clearMainCharacterForUser,
  getCurrentUserProfile,
  setMainCharacterForUser,
} from '@/lib/profile';
import { fetchCharacter, TibiaDataNotFoundError } from '@/lib/tibiadata';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  let payload: LinkMainCharacterRequestDto;
  try {
    payload = (await request.json()) as LinkMainCharacterRequestDto;
  } catch (error) {
    logError('auth.mainCharacter.link', ErrorCode.REQUEST_INVALID_JSON, {}, error);
    return errorResponse('Request body must be valid JSON', 400, ErrorCode.REQUEST_INVALID_JSON);
  }

  const characterName = payload?.name?.trim();
  if (!characterName) {
    return errorResponse('Character name is required', 400, ErrorCode.VALIDATION_FAILED);
  }

  let character: TibiaCharacterDto;
  try {
    character = await fetchCharacter(characterName);
  } catch (error) {
    if (error instanceof TibiaDataNotFoundError) {
      return errorResponse('Character not found', 404, ErrorCode.NOT_FOUND);
    }
    logError('auth.mainCharacter.fetch', ErrorCode.INTERNAL_ERROR, { name: characterName }, error);
    return errorResponse('Could not verify character', 502, ErrorCode.INTERNAL_ERROR);
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
      return errorResponse('Current user not found', 404, ErrorCode.NOT_FOUND);
    }

    return NextResponse.json<ApiResponse<AuthCurrentUserResponseDto>>({ data: { user } });
  } catch (error) {
    logError('auth.mainCharacter.save', ErrorCode.DB_QUERY_FAILED, { name: characterName }, error);
    return errorResponse('Could not link main character', 500, ErrorCode.DB_QUERY_FAILED);
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
      return errorResponse('Current user not found', 404, ErrorCode.NOT_FOUND);
    }

    return NextResponse.json<ApiResponse<AuthCurrentUserResponseDto>>({ data: { user } });
  } catch (error) {
    logError('auth.mainCharacter.clear', ErrorCode.DB_QUERY_FAILED, {}, error);
    return errorResponse('Could not unlink main character', 500, ErrorCode.DB_QUERY_FAILED);
  }
}
