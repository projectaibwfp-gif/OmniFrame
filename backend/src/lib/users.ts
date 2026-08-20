import type { UserRole, UsersListItemDto } from '@shared/api-contract';
import { getSql } from './db';

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
  referralCode: string;
  referredByCode: string | null;
  referredByName: string | null;
  registeredAt: string;
  lastLoginAt: string;
}

function mapUserRow(row: UserRow): UsersListItemDto {
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
    referralCode: row.referralCode,
    referredByCode: row.referredByCode,
    referredByName: row.referredByName,
    registeredAt: row.registeredAt,
    lastLoginAt: row.lastLoginAt,
  };
}

export async function listUsers(limit = 50): Promise<UsersListItemDto[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT users.id, users.google_id, users.email, users.email_verified, users.role, users.name,
           users.given_name, users.family_name, users.picture, users.locale,
           users.referral_code AS "referralCode",
           users.referred_by_code AS "referredByCode",
           COALESCE(NULLIF(trim(concat(referrer.given_name, ' ', referrer.family_name)), ''), referrer.name, referrer.email) AS "referredByName",
           to_char(users.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS "registeredAt",
           to_char(users.last_login_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS "lastLoginAt"
    FROM users
    LEFT JOIN users AS referrer ON referrer.referral_code = users.referred_by_code
    ORDER BY users.created_at DESC
    LIMIT ${limit}
  `) as UserRow[];

  return rows.map(mapUserRow);
}

export async function getUserByGoogleId(googleId: string): Promise<UsersListItemDto | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT users.id, users.google_id, users.email, users.email_verified, users.role, users.name,
           users.given_name, users.family_name, users.picture, users.locale,
           users.referral_code AS "referralCode",
           users.referred_by_code AS "referredByCode",
           COALESCE(NULLIF(trim(concat(referrer.given_name, ' ', referrer.family_name)), ''), referrer.name, referrer.email) AS "referredByName",
           to_char(users.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS "registeredAt",
           to_char(users.last_login_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS "lastLoginAt"
    FROM users
    LEFT JOIN users AS referrer ON referrer.referral_code = users.referred_by_code
    WHERE users.google_id = ${googleId}
    LIMIT 1
  `) as UserRow[];

  return rows.length > 0 ? mapUserRow(rows[0]) : null;
}
