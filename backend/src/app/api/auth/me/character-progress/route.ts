import { NextResponse, type NextRequest } from 'next/server';
import type {
  ApiResponse,
  CharacterProgressListDto,
  CharacterProgressUpdateRequestDto,
  CharacterProgressUpdateResponseDto,
} from '@shared/api-contract';
import { CharacterProgressUpdateRequestSchema } from '@shared/api-schemas';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { listCharacterProgress, upsertCharacterProgress } from '@/lib/character-progress';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';
import { parseJsonBody } from '@/lib/request-validation';
import { getCurrentUserProfile } from '@/lib/profile';

export const dynamic = 'force-dynamic';

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
    return errorResponse('Could not load character progress', 500, ErrorCode.DB_QUERY_FAILED);
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

  const user = await getCurrentUserProfile(auth.session.sub);
  if (user?.mainCharacter?.name == null) {
    return errorResponse('No main character linked', 400, ErrorCode.VALIDATION_FAILED);
  }

  const payload: CharacterProgressUpdateRequestDto = validation.data;

  try {
    const entry = await upsertCharacterProgress({
      googleId: auth.session.sub,
      characterName: user.mainCharacter.name,
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
    return errorResponse('Could not save character progress', 500, ErrorCode.DB_QUERY_FAILED);
  }
}
