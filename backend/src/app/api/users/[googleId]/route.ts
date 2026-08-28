import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, UsersListItemDto } from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';
import { getUserByGoogleId } from '@/lib/users';

export const dynamic = 'force-dynamic';

interface RouteParams {
  googleId: string;
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<RouteParams> },
): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const { googleId } = await props.params;
  const normalizedGoogleId = decodeURIComponent(googleId).trim();
  if (!normalizedGoogleId) {
    return errorResponse('Google ID is required', 400, ErrorCode.VALIDATION_FAILED);
  }

  try {
    const user = await getUserByGoogleId(normalizedGoogleId);
    if (user === null) {
      return errorResponse('User not found', 404, ErrorCode.NOT_FOUND);
    }

    return NextResponse.json<ApiResponse<UsersListItemDto>>({ data: user });
  } catch (error) {
    logError('users.getOne', ErrorCode.DB_QUERY_FAILED, { googleId: normalizedGoogleId }, error);
    return errorResponse('Could not fetch user', 500, ErrorCode.DB_QUERY_FAILED);
  }
}
