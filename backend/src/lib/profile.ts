import type { AuthCurrentUserDto } from '@shared/api-contract';
import { getSql } from './db';
import { mapUserRow, type UserRow } from './user-row';

interface UpdateProfileInput {
  googleId: string;
  phone: string | null;
  birthDate: string | null;
  description: string | null;
}

interface SetMainCharacterInput {
  googleId: string;
  name: string;
  world: string | null;
  vocation: string | null;
  level: number | null;
}

export async function getCurrentUserProfile(googleId: string): Promise<AuthCurrentUserDto | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, google_id, email, email_verified, role, name,
           given_name, family_name, picture, locale, phone, birth_date, description,
           referral_code, referred_by_code,
           main_character_name, main_character_world, main_character_vocation,
           main_character_level, main_character_linked_at,
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

export async function setMainCharacterForUser(input: SetMainCharacterInput): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE users
    SET main_character_name = ${input.name},
        main_character_world = ${input.world},
        main_character_vocation = ${input.vocation},
        main_character_level = ${input.level},
        main_character_linked_at = now(),
        updated_at = now()
    WHERE google_id = ${input.googleId}
  `;
}

export async function clearMainCharacterForUser(googleId: string): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE users
    SET main_character_name = NULL,
        main_character_world = NULL,
        main_character_vocation = NULL,
        main_character_level = NULL,
        main_character_linked_at = NULL,
        updated_at = now()
    WHERE google_id = ${googleId}
  `;
}
