import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, UsersListItemDto } from '@shared/api-contract';
import { GoogleIdParamSchema } from '@shared/api-schemas';
import { errorResponse } from '@/lib/api-response';
import { parseRouteParams } from '@/lib/request-validation';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';
import { getUserByGoogleId } from '@/lib/users';

export const dynamic = 'force-dynamic';

interface RouteParams extends Record<string, string | undefined> {
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

  const params = await props.params;
  const validation = parseRouteParams(params, GoogleIdParamSchema, {
    scope: 'users.getOne',
  });
  if (!validation.ok) {
    return validation.response;
  }

  const googleId = validation.data.googleId;

  try {
    const user = await getUserByGoogleId(googleId);
    if (user === null) {
      return errorResponse('User not found', 404, ErrorCode.NOT_FOUND);
    }

    return NextResponse.json<ApiResponse<UsersListItemDto>>({ data: user });
  } catch (error) {
    logError('users.getOne', ErrorCode.DB_QUERY_FAILED, { googleId }, error);
    return errorResponse('Could not fetch user', 500, ErrorCode.DB_QUERY_FAILED);
  }
}
