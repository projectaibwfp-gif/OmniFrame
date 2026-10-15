import { NextResponse, type NextRequest } from 'next/server';
import type {
  ApiResponse,
  CharacterProgressListDto,
  CharacterProgressUpdateRequestDto,
  CharacterProgressUpdateResponseDto,
} from '@shared/api-contract';
import { CharacterProgressUpdateRequestSchema } from '@shared/api-schemas';
import { errorResponse, type RouteResult } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { listCharacterProgress, upsertCharacterProgress } from '@/lib/character-progress';
import { ErrorCode } from '@/lib/errors';
import { HttpStatus } from '@/lib/http-status';
import { logError } from '@/lib/logger';
import { parseJsonBody } from '@/lib/request-validation';
import { getCurrentUserProfile } from '@/lib/profile';

export const dynamic = 'force-dynamic';

async function loadMainCharacterName(googleId: string): Promise<RouteResult<string>> {
  try {
    const user = await getCurrentUserProfile(googleId);
    if (user?.mainCharacter?.name == null) {
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
  } catch (error) {
    logError('auth.characterProgress.loadUser', ErrorCode.DB_QUERY_FAILED, {}, error);
    return {
      ok: false,
      response: errorResponse(
        'Could not load current user',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.DB_QUERY_FAILED,
      ),
    };
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  try {
    const entries = await listCharacterProgress(auth.session.sub);
    const data: CharacterProgressListDto = { entries };
    return NextResponse.json<ApiResponse<CharacterProgressListDto>>({ data });
  } catch (error) {
    logError('auth.characterProgress.list', ErrorCode.DB_QUERY_FAILED, {}, error);
    return errorResponse(
      'Could not load character progress',
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

  const validation = await parseJsonBody(request, CharacterProgressUpdateRequestSchema, {
    scope: 'auth.characterProgress.update',
  });
  if (!validation.ok) {
    return validation.response;
  }

  const mainCharacterName = await loadMainCharacterName(auth.session.sub);
  if (!mainCharacterName.ok) {
    return mainCharacterName.response;
  }

  const payload: CharacterProgressUpdateRequestDto = validation.data;

  try {
    const entry = await upsertCharacterProgress({
      googleId: auth.session.sub,
      characterName: mainCharacterName.data,
      targetKind: payload.targetKind,
      targetName: payload.targetName,
      status: payload.status,
    });
    const data: CharacterProgressUpdateResponseDto = { entry };
    return NextResponse.json<ApiResponse<CharacterProgressUpdateResponseDto>>({ data });
  } catch (error) {
    logError(
      'auth.characterProgress.update',
      ErrorCode.DB_QUERY_FAILED,
      { targetKind: payload.targetKind, targetName: payload.targetName },
      error,
    );
    return errorResponse(
      'Could not save character progress',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DB_QUERY_FAILED,
    );
  }
}
