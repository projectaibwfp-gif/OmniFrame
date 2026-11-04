import { NextResponse, type NextRequest } from 'next/server';
import type { UsersListResponseDto } from '@shared/api-contract';
import { UpsertUserRequestSchema } from '@shared/api-schemas';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAdmin, upsertUser } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { HttpStatus } from '@/lib/http-status';
import { logError } from '@/lib/logger';
import { parseJsonBody } from '@/lib/request-validation';
import { listUsers } from '@/lib/users';

const DEFAULT_USERS_LIMIT = 50;
const MAX_USERS_LIMIT = 200;

export const dynamic = 'force-dynamic';

/**
 * GET /api/users
 * Returns paginated list of all users, ordered by registration date (newest first).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
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
    return errorResponse(
      'Could not list users',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DB_QUERY_FAILED,
    );
  }
}

/**
 * POST /api/users
 * Admin-only upsert of a user from Google OAuth data.
 * Matches on google_id — creates on first call, otherwise updates the stored profile.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const validation = await parseJsonBody(request, UpsertUserRequestSchema, {
    scope: 'users.create',
  });
  if (!validation.ok) {
    return validation.response;
  }

  const { googleId, email, emailVerified, name, givenName, familyName, picture, locale, role } =
    validation.data;

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

    return NextResponse.json({ data: user }, { status: HttpStatus.OK });
  } catch (error) {
    logError('users.create', ErrorCode.AUTH_USER_UPSERT_FAILED, { googleId }, error);
    return errorResponse(
      'Could not upsert user',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.AUTH_USER_UPSERT_FAILED,
    );
  }
}
