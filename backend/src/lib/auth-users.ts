import { createHash } from 'node:crypto';
import type { AuthCurrentUserDto } from '@shared/api-contract';
import { NextRequest, NextResponse } from 'next/server';
import { getSql } from './db';
import { isAuthDenied, requireAuth, type UserRole } from './auth-session';

export type AuthenticatedUser = AuthCurrentUserDto;

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
  phone: string | null;
  birth_date: string | null;
  description: string | null;
  referral_code: string;
  referred_by_code: string | null;
  last_login_at: string;
  created_at: string;
  updated_at: string;
}

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

function mapUserRow(row: UserRow): AuthenticatedUser {
  return {
    id: row.id,
    google_id: row.google_id,
    email: row.email,
    email_verified: row.email_verified,
    role: row.role,
    name: row.name,
    given_name: row.given_name,
    family_name: row.family_name,
    picture: row.picture,
    locale: row.locale,
    phone: row.phone,
    birthDate: row.birth_date,
    description: row.description,
    referralCode: row.referral_code,
    referredByCode: row.referred_by_code,
    registeredAt: row.created_at,
    lastLoginAt: row.last_login_at,
    updatedAt: row.updated_at,
  };
}

function generateReferralCode(googleId: string): string {
  return createHash('md5').update(googleId).digest('hex');
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

  return {
    user: mapUserRow(rows[0]),
    wasCreated: rows[0].was_created,
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
    google_id: auth.session.sub,
    email: auth.session.email,
    email_verified: auth.session.email_verified === true,
    role: 'user',
    name: auth.session.name ?? null,
    given_name: auth.session.given_name ?? null,
    family_name: auth.session.family_name ?? null,
    picture: auth.session.picture ?? null,
    locale: auth.session.locale ?? null,
    phone: null,
    birthDate: null,
    description: null,
    referralCode: createHash('md5').update(auth.session.sub).digest('hex'),
    referredByCode: null,
    registeredAt: '',
    lastLoginAt: '',
    updatedAt: '',
  };
}
