import { createHash } from 'node:crypto';
import type { AuthCurrentUserDto } from '@shared/api-contract';
import type { NextRequest, NextResponse } from 'next/server';
import { getSql } from './db';
import { isAuthDenied, requireAuth, type UserRole } from './auth-session';
import { mapUserRow, type UserRow } from './user-row';

const REFERRAL_CODE_HASH_ALGORITHM = 'md5';

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
  was_created: boolean;
}

export interface UpsertUserResult {
  user: AuthenticatedUser;
  wasCreated: boolean;
}

function generateReferralCode(googleId: string): string {
  return createHash(REFERRAL_CODE_HASH_ALGORITHM).update(googleId).digest('hex');
}

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
       ${input.role ?? 'user'},
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
               last_login_at, created_at, updated_at,
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
         role           = ${input.role ?? 'user'},
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
               last_login_at, created_at, updated_at,
               false AS was_created
    )
    SELECT id, google_id, email, email_verified, role, name,
          given_name, family_name, picture, locale, phone, birth_date, description,
          referral_code, referred_by_code,
          last_login_at, created_at, updated_at, was_created
    FROM inserted
    UNION ALL
    SELECT id, google_id, email, email_verified, role, name,
          given_name, family_name, picture, locale, phone, birth_date, description,
          referral_code, referred_by_code,
          last_login_at, created_at, updated_at, was_created
    FROM updated
  `) as UpsertUserRow[];

  const row = rows[0];

  return {
    user: mapUserRow(row),
    wasCreated: row.was_created,
  };
}

export async function upsertGoogleUser(
  payload: {
    sub: string;
    email: string;
    email_verified?: boolean;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    locale?: string;
  },
  referredByCode?: string | null,
  role?: UserRole,
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
    role,
  });
}

export async function loadCurrentUser(
  request: NextRequest,
): Promise<AuthenticatedUser | NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const sql = getSql();
  const rows = (await sql`
    SELECT id, google_id, email, email_verified, role, name,
           given_name, family_name, picture, locale, phone, birth_date, description,
           referral_code, referred_by_code,
           main_character_name, main_character_world, main_character_vocation,
           main_character_level, main_character_linked_at,
           last_login_at, created_at, updated_at
    FROM users
    WHERE google_id = ${auth.session.sub}
    LIMIT 1
  `) as UserRow[];

  if (rows.length > 0) {
    return mapUserRow(rows[0]);
  }

  return {
    id: 0,
    googleId: auth.session.sub,
    email: auth.session.email,
    emailVerified: auth.session.email_verified === true,
    role: 'user',
    name: auth.session.name ?? null,
    givenName: auth.session.given_name ?? null,
    familyName: auth.session.family_name ?? null,
    picture: auth.session.picture ?? null,
    locale: auth.session.locale ?? null,
    phone: null,
    birthDate: null,
    description: null,
    referralCode: generateReferralCode(auth.session.sub),
    referredByCode: null,
    mainCharacter: null,
    registeredAt: '',
    lastLoginAt: '',
    updatedAt: '',
  };
}
