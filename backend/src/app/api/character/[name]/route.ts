import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, TibiaCharacterDto } from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';
import { fetchCharacter, TibiaDataNotFoundError } from '@/lib/tibiadata';

export const dynamic = 'force-dynamic';

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
    const data = await fetchCharacter(characterName);
    return NextResponse.json<ApiResponse<TibiaCharacterDto>>({ data });
  } catch (error) {
    if (error instanceof TibiaDataNotFoundError) {
      return errorResponse('Character not found', 404, ErrorCode.NOT_FOUND);
    }

    logError('character.get', ErrorCode.INTERNAL_ERROR, { name: characterName }, error);
    return errorResponse('Could not load character details', 502, ErrorCode.INTERNAL_ERROR);
  }
}
