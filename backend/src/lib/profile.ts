import type { AuthCurrentUserDto } from '@shared/api-contract';
import { getSql } from './db';

interface UserRow {
  id: number;
  google_id: string;
  email: string;
  email_verified: boolean;
  role: AuthCurrentUserDto['role'];
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

interface UpdateProfileInput {
  googleId: string;
  phone: string | null;
  birthDate: string | null;
  description: string | null;
}

function mapUserRow(row: UserRow): AuthCurrentUserDto {
  return {
    id: row.id,
    googleId: row.google_id,
    email: row.email,
    emailVerified: row.email_verified,
    role: row.role,
    name: row.name,
    givenName: row.given_name,
    familyName: row.family_name,
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

export async function getCurrentUserProfile(googleId: string): Promise<AuthCurrentUserDto | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, google_id, email, email_verified, role, name,
           given_name, family_name, picture, locale, phone, birth_date, description,
           referral_code, referred_by_code,
           last_login_at, created_at, updated_at
    FROM users
    WHERE google_id = ${googleId}
    LIMIT 1
  `) as UserRow[];

  return rows.length > 0 ? mapUserRow(rows[0]) : null;
}

export async function updateCurrentUserProfile(input: UpdateProfileInput): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE users
    SET phone = ${input.phone},
        birth_date = ${input.birthDate},
        description = ${input.description},
        updated_at = now()
    WHERE google_id = ${input.googleId}
  `;
}
