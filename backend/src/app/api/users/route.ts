import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth, type UserRole, upsertUser } from '@/lib/auth';
import { getSql } from '@/lib/db';

interface GoogleUserPayload {
  google_id: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
  role?: UserRole;
}

interface UserRow {
  id: number;
  google_id: string;
  email: string;
  email_verified: boolean;
  role: UserRole;
  name: string | null;
  given_name: string | null;
  family_name: string | null;
  picture: string | null;
  locale: string | null;
  registeredAt: string;
  lastLoginAt: string;
}

export const dynamic = 'force-dynamic';

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
      const rows = (await getSql()`
        SELECT id, google_id, email, email_verified, role, name,
               given_name, family_name, picture, locale,
               to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS "registeredAt",
               to_char(last_login_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS "lastLoginAt"
        FROM users
        WHERE google_id = ${googleId}
        LIMIT 1
      `) as UserRow[];

      if (rows.length === 0) {
        return errorResponse('User not found', 404);
      }

      return NextResponse.json({ data: rows[0] });
    } catch (error) {
      console.error('Could not fetch user', error);
      return errorResponse('Could not fetch user', 500);
    }
  }

  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = Math.min(Math.max(parseInt(limitParam ?? '50', 10) || 50, 1), 200);

  try {
    const rows = (await getSql()`
      SELECT id, google_id, email, email_verified, role, name,
             given_name, family_name, picture, locale,
             to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS "registeredAt",
             to_char(last_login_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS "lastLoginAt"
      FROM users
      ORDER BY created_at DESC
      LIMIT ${limit}
    `) as UserRow[];

    return NextResponse.json({ data: rows, total: rows.length });
  } catch (error) {
    console.error('Could not list users', error);
    return errorResponse('Could not list users', 500);
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
  } catch {
    return errorResponse('Request body must be valid JSON', 400);
  }

  const { google_id, email, email_verified, name, given_name, family_name, picture, locale } =
    payload;
  const role = payload.role ?? 'user';

  if (!google_id?.trim()) {
    return errorResponse('google_id is required', 400);
  }

  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse('A valid email is required', 400);
  }

  if (!['admin', 'user', 'moderator'].includes(role)) {
    return errorResponse('role must be admin, user, or moderator', 400);
  }

  try {
    const user = await upsertUser({
      google_id,
      email,
      email_verified,
      name,
      given_name,
      family_name,
      picture,
      locale,
      role,
    });

    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error) {
    console.error('Could not upsert user', error);
    return errorResponse('Could not upsert user', 500);
  }
}
