import { NextRequest, NextResponse } from 'next/server';
import type {
  ApiResponse,
  UserRole,
  UsersListItemDto,
  UsersListResponseDto,
} from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth, upsertUser } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';
import { getUserByGoogleId, listUsers } from '@/lib/users';

export const dynamic = 'force-dynamic';

type GoogleUserPayload = {
  googleId: string;
  email: string;
  emailVerified?: boolean;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  locale?: string;
  role?: UserRole;
};

/**
 * GET /api/users
 * Returns paginated list of all users, ordered by registration date (newest first).
 *
 * GET /api/users?google_id=<id>
 * Returns a single user by Google ID.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const googleId = request.nextUrl.searchParams.get('google_id');

  if (googleId) {
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

  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = Math.min(Math.max(parseInt(limitParam ?? '50', 10) || 50, 1), 200);

  try {
    const rows = await listUsers(limit);

    return NextResponse.json<UsersListResponseDto>({ data: rows, total: rows.length });
  } catch (error) {
    logError('users.list', ErrorCode.DB_QUERY_FAILED, { limit }, error);
    return errorResponse('Could not list users', 500, ErrorCode.DB_QUERY_FAILED);
  }
}

/**
 * POST /api/users
 * Upserts a user from Google OAuth data.
 * Matches on google_id — creates on first login, updates last_login_at on subsequent logins.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  let payload: GoogleUserPayload;

  try {
    payload = (await request.json()) as GoogleUserPayload;
  } catch (error) {
    logError('users.create', ErrorCode.REQUEST_INVALID_JSON, {}, error);
    return errorResponse('Request body must be valid JSON', 400, ErrorCode.REQUEST_INVALID_JSON);
  }

  const { googleId, email, emailVerified, name, givenName, familyName, picture, locale } = payload;
  const role = payload.role ?? 'user';

  if (!googleId?.trim()) {
    return errorResponse('googleId is required', 400, ErrorCode.VALIDATION_FAILED);
  }

  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse('A valid email is required', 400, ErrorCode.VALIDATION_FAILED);
  }

  if (!['admin', 'user', 'moderator'].includes(role)) {
    return errorResponse(
      'role must be admin, user, or moderator',
      400,
      ErrorCode.VALIDATION_FAILED,
    );
  }

  try {
    const { user } = await upsertUser({
      google_id: googleId,
      email,
      email_verified: emailVerified,
      name,
      given_name: givenName,
      family_name: familyName,
      picture,
      locale,
      role,
    });

    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error) {
    logError('users.create', ErrorCode.AUTH_USER_UPSERT_FAILED, { googleId }, error);
    return errorResponse('Could not upsert user', 500, ErrorCode.AUTH_USER_UPSERT_FAILED);
  }
}
