import { NextResponse, type NextRequest } from 'next/server';
import type {
  ApiResponse,
  UserRole,
  UsersListResponseDto,
} from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth, upsertUser } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';
import { listUsers } from '@/lib/users';
import { DEFAULT_USER_ROLE, USER_ROLES } from '@/lib/validation';

const DEFAULT_USERS_LIMIT = 50;
const MAX_USERS_LIMIT = 200;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = Math.min(
    Math.max(parseInt(limitParam ?? String(DEFAULT_USERS_LIMIT), 10) || DEFAULT_USERS_LIMIT, 1),
    MAX_USERS_LIMIT,
  );

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
  const role = payload.role ?? DEFAULT_USER_ROLE;

  if (!googleId?.trim()) {
    return errorResponse('googleId is required', 400, ErrorCode.VALIDATION_FAILED);
  }

  if (!email?.trim() || !EMAIL_PATTERN.test(email)) {
    return errorResponse('A valid email is required', 400, ErrorCode.VALIDATION_FAILED);
  }

  if (!USER_ROLES.includes(role)) {
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
