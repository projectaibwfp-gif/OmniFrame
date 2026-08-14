import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-response';
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
}

interface UserRow {
  id: number;
  google_id: string;
  email: string;
  email_verified: boolean;
  name: string | null;
  given_name: string | null;
  family_name: string | null;
  picture: string | null;
  locale: string | null;
  last_login_at: string;
  created_at: string;
  updated_at: string;
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
  const googleId = request.nextUrl.searchParams.get('google_id');

  if (googleId) {
    try {
      const rows = (await getSql()`
        SELECT id, google_id, email, email_verified, name,
               given_name, family_name, picture, locale,
               last_login_at, created_at, updated_at
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
      SELECT id, google_id, email, email_verified, name,
             given_name, family_name, picture, locale,
             last_login_at,
             to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS "registeredAt",
             to_char(last_login_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS "lastLoginAt"
      FROM users
      ORDER BY created_at DESC
      LIMIT ${limit}
    `) as (UserRow & { registeredAt: string; lastLoginAt: string })[];

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
  let payload: GoogleUserPayload;

  try {
    payload = (await request.json()) as GoogleUserPayload;
  } catch {
    return errorResponse('Request body must be valid JSON', 400);
  }

  const { google_id, email, email_verified, name, given_name, family_name, picture, locale } =
    payload;

  if (!google_id?.trim()) {
    return errorResponse('google_id is required', 400);
  }

  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse('A valid email is required', 400);
  }

  try {
    const rows = (await getSql()`
      INSERT INTO users (google_id, email, email_verified, name, given_name, family_name, picture, locale, last_login_at)
      VALUES (
        ${google_id},
        ${email},
        ${email_verified ?? false},
        ${name ?? null},
        ${given_name ?? null},
        ${family_name ?? null},
        ${picture ?? null},
        ${locale ?? null},
        now()
      )
      ON CONFLICT (google_id) DO UPDATE SET
        email          = EXCLUDED.email,
        email_verified = EXCLUDED.email_verified,
        name           = EXCLUDED.name,
        given_name     = EXCLUDED.given_name,
        family_name    = EXCLUDED.family_name,
        picture        = EXCLUDED.picture,
        locale         = EXCLUDED.locale,
        last_login_at  = now(),
        updated_at     = now()
      RETURNING id, google_id, email, email_verified, name,
                given_name, family_name, picture, locale,
                last_login_at, created_at, updated_at
    `) as UserRow[];

    const user = rows[0];
    const isNew = user.created_at === user.updated_at;

    return NextResponse.json({ data: user }, { status: isNew ? 201 : 200 });
  } catch (error) {
    console.error('Could not upsert user', error);
    return errorResponse('Could not upsert user', 500);
  }
}
