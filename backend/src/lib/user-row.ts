import type { AuthCurrentUserDto } from '@shared/api-contract';

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
  birth_date: string | null;
  description: string | null;
  referral_code: string;
  referred_by_code: string | null;
  last_login_at: string;
  created_at: string;
  updated_at: string;
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
    registeredAt: row.created_at,
    lastLoginAt: row.last_login_at,
    updatedAt: row.updated_at,
  };
}
