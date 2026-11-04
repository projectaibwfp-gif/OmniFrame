import { createHash } from 'node:crypto';
import type { AuthCurrentUserDto } from '@shared/api-contract';
import type { NextRequest } from 'next/server';
import { errorResponse } from './api-response';
import { getSql } from './db';
import {
  isAuthDenied,
  requireAuth,
  type AuthCheckResult,
  type GoogleTokenPayload,
  type UserRole,
} from './auth-session';
import { ErrorCode } from './errors';
import { HttpStatus } from './http-status';
import { logError, logWarn } from './logger';
import { mapUserRow, type UserRow } from './user-row';
import { DEFAULT_USER_ROLE } from './validation';

const REFERRAL_CODE_HASH_ALGORITHM = 'md5';
const ADMIN_ROLE: UserRole = 'admin';
const ADMIN_EMAILS_SEPARATOR = ',';

export type AuthenticatedUser = AuthCurrentUserDto;

export interface UpsertUserInput {
  google_id: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
  referred_by_code?: string | null;
  role?: UserRole;
}

interface UpsertUserRow extends UserRow {
  session_version: number;
  was_created: boolean;
}

export interface UpsertUserResult {
  user: AuthenticatedUser;
  sessionVersion: number;
  wasCreated: boolean;
}

function generateReferralCode(googleId: string): string {
  return createHash(REFERRAL_CODE_HASH_ALGORITHM).update(googleId).digest('hex');
}

/**
 * Logging in never passes a role, so an existing user's role is only changed
 * when the caller sets it explicitly (admin user management).
 */
export async function upsertUser(input: UpsertUserInput): Promise<UpsertUserResult> {
  const referralCode = generateReferralCode(input.google_id);
  const sql = getSql();
  const rows = (await sql`
    WITH inserted AS (
     INSERT INTO users (
       google_id,
       email,
       email_verified,
       role,
       name,
       given_name,
       family_name,
       picture,
       locale,
       referral_code,
       referred_by_code,
       last_login_at
     )
     VALUES (
       ${input.google_id},
       ${input.email},
       ${input.email_verified ?? false},
       ${input.role ?? DEFAULT_USER_ROLE},
       ${input.name ?? null},
       ${input.given_name ?? null},
       ${input.family_name ?? null},
       ${input.picture ?? null},
       ${input.locale ?? null},
       ${referralCode},
       ${input.referred_by_code ?? null},
       now()
     )
     ON CONFLICT (google_id) DO NOTHING
     RETURNING id, google_id, email, email_verified, role, name,
               given_name, family_name, picture, locale, phone, birth_date, description,
               referral_code, referred_by_code,
               last_login_at, created_at, updated_at, session_version,
               true AS was_created
    ),
    recorded_referral AS (
     INSERT INTO user_referral_attributions (user_id, referral_code)
     SELECT id, ${input.referred_by_code ?? null}
     FROM inserted
     WHERE ${input.referred_by_code ?? null}::text IS NOT NULL
     RETURNING user_id
    ),
    updated AS (
     UPDATE users
     SET email          = ${input.email},
         email_verified = ${input.email_verified ?? false},
         role           = COALESCE(${input.role ?? null}, role),
         name           = ${input.name ?? null},
         given_name     = ${input.given_name ?? null},
         family_name    = ${input.family_name ?? null},
         picture        = ${input.picture ?? null},
         locale         = ${input.locale ?? null},
         referral_code  = COALESCE(referral_code, ${referralCode}),
         last_login_at  = now(),
         updated_at     = now()
     WHERE google_id = ${input.google_id}
       AND NOT EXISTS (SELECT 1 FROM inserted)
     RETURNING id, google_id, email, email_verified, role, name,
               given_name, family_name, picture, locale, phone, birth_date, description,
               referral_code, referred_by_code,
               last_login_at, created_at, updated_at, session_version,
               false AS was_created
    )
    SELECT id, google_id, email, email_verified, role, name,
          given_name, family_name, picture, locale, phone, birth_date, description,
          referral_code, referred_by_code,
          last_login_at, created_at, updated_at, session_version, was_created
    FROM inserted
    UNION ALL
    SELECT id, google_id, email, email_verified, role, name,
          given_name, family_name, picture, locale, phone, birth_date, description,
          referral_code, referred_by_code,
          last_login_at, created_at, updated_at, session_version, was_created
    FROM updated
  `) as UpsertUserRow[];

  const row = rows[0];

  return {
    user: mapUserRow(row),
    sessionVersion: row.session_version,
    wasCreated: row.was_created,
  };
}

export async function upsertGoogleUser(
  payload: GoogleTokenPayload,
  referredByCode?: string | null,
): Promise<UpsertUserResult> {
  return upsertUser({
    google_id: payload.sub,
    email: payload.email,
    email_verified: payload.email_verified,
    name: payload.name,
    given_name: payload.given_name,
    family_name: payload.family_name,
    picture: payload.picture,
    locale: payload.locale,
    referred_by_code: referredByCode,
    role: isBootstrapAdmin(payload) ? ADMIN_ROLE : undefined,
  });
}

function readAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(ADMIN_EMAILS_SEPARATOR)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * ADMIN_EMAILS only promotes. Demoting such an account requires removing it
 * from the variable first, otherwise the next login restores the admin role.
 */
function isBootstrapAdmin(payload: GoogleTokenPayload): boolean {
  return payload.email_verified === true && readAdminEmails().includes(payload.email.toLowerCase());
}

async function readUserRole(googleId: string): Promise<UserRole | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT role
    FROM users
    WHERE google_id = ${googleId}
    LIMIT 1
  `) as Array<{ role: UserRole }>;

  return rows[0]?.role ?? null;
}

export async function requireAdmin(request: NextRequest): Promise<AuthCheckResult> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth;
  }

  let role: UserRole | null;
  try {
    role = await readUserRole(auth.session.sub);
  } catch (error) {
    logError('auth.requireAdmin', ErrorCode.DB_QUERY_FAILED, { sub: auth.session.sub }, error);
    return {
      response: errorResponse(
        'Could not verify user role',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.DB_QUERY_FAILED,
      ),
    };
  }

  if (role !== ADMIN_ROLE) {
    logWarn('auth.requireAdmin', ErrorCode.AUTH_FORBIDDEN, { sub: auth.session.sub, role });
    return {
      response: errorResponse(
        'Admin role required',
        HttpStatus.FORBIDDEN,
        ErrorCode.AUTH_FORBIDDEN,
      ),
    };
  }

  return auth;
}
