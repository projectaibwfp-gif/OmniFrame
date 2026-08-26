import type { AuthCurrentUserDto } from '@shared/api-contract';
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
  last_login_at: SqlTimestamp;
  created_at: SqlTimestamp;
  updated_at: SqlTimestamp;
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
    registeredAt: toIsoUtc(row.created_at),
    lastLoginAt: toIsoUtc(row.last_login_at),
    updatedAt: toIsoUtc(row.updated_at),
  };
}
