import type { AuthCurrentUserDto } from '@shared/api-contract';
import { getSql } from './db';
import { mapUserRow, type UserRow } from './user-row';

interface UpdateProfileInput {
  googleId: string;
  phone: string | null;
  birthDate: string | null;
  description: string | null;
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
