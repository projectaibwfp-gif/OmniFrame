import type { AuthCurrentUserDto, UserMainCharacterDto } from '@shared/api-contract';
import { toIsoUtc, type SqlTimestamp } from './date-time';

export interface UserRow {
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
  /** Kolumna DATE - data kalendarzowa bez strefy, nie przechodzi przez `toIsoUtc`. */
  birth_date: string | null;
  description: string | null;
  referral_code: string;
  referred_by_code: string | null;
  main_character_name: string | null;
  main_character_world: string | null;
  main_character_vocation: string | null;
  main_character_level: number | null;
  main_character_linked_at: SqlTimestamp | null;
  last_login_at: SqlTimestamp;
  created_at: SqlTimestamp;
  updated_at: SqlTimestamp;
}

function mapMainCharacter(row: UserRow): UserMainCharacterDto | null {
  if (!row.main_character_name || !row.main_character_linked_at) {
    return null;
  }

  return {
    name: row.main_character_name,
    world: row.main_character_world,
    vocation: row.main_character_vocation,
    level: row.main_character_level,
    linkedAt: toIsoUtc(row.main_character_linked_at),
  };
}

export function mapUserRow(row: UserRow): AuthCurrentUserDto {
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
    mainCharacter: mapMainCharacter(row),
    registeredAt: toIsoUtc(row.created_at),
    lastLoginAt: toIsoUtc(row.last_login_at),
    updatedAt: toIsoUtc(row.updated_at),
  };
}
