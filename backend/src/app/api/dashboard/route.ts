import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth, type UserRole } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';

interface OverviewRow {
  totalUsers: number | string;
  verifiedUsers: number | string;
  loginsToday: number | string;
  newUsersToday: number | string;
  referredUsers: number | string;
}

interface ActivityRow {
  label: string;
  signups: number | string;
  logins: number | string;
  referredSignups: number | string;
}

interface RecentUserRow {
  id: number;
  email: string;
  role: UserRole;
  name: string | null;
  given_name: string | null;
  family_name: string | null;
  lastLoginAt: string;
  registeredAt: string;
  referredByCode: string | null;
}

interface TopReferrerRow {
  id: number;
  name: string | null;
  email: string;
  referralCode: string;
  referrals: number | string;
}

function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : parseInt(value, 10) || 0;
}

function toDisplayName(user: {
  given_name: string | null;
  family_name: string | null;
  name: string | null;
  email: string;
}): string {
  const fullName = `${user.given_name ?? ''} ${user.family_name ?? ''}`.trim();
  return fullName || user.name?.trim() || user.email;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  try {
    const overviewRows = (await getSql()`
      SELECT COUNT(*) AS "totalUsers",
             COUNT(*) FILTER (WHERE email_verified = true) AS "verifiedUsers",
             COUNT(*) FILTER (WHERE last_login_at >= date_trunc('day', now())) AS "loginsToday",
             COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now())) AS "newUsersToday",
             COUNT(*) FILTER (WHERE referred_by_code IS NOT NULL) AS "referredUsers"
      FROM users
    `) as OverviewRow[];

    const activityRows = (await getSql()`
      WITH days AS (
        SELECT generate_series(
          date_trunc('day', now()) - interval '6 day',
          date_trunc('day', now()),
          interval '1 day'
        ) AS day
      )
      SELECT to_char(day, 'DD.MM') AS label,
             (
               SELECT COUNT(*)
               FROM users
               WHERE created_at >= day
                 AND created_at < day + interval '1 day'
             ) AS signups,
             (
               SELECT COUNT(*)
               FROM users
               WHERE last_login_at >= day
                 AND last_login_at < day + interval '1 day'
             ) AS logins,
             (
               SELECT COUNT(*)
               FROM users
               WHERE created_at >= day
                 AND created_at < day + interval '1 day'
                 AND referred_by_code IS NOT NULL
             ) AS "referredSignups"
      FROM days
      ORDER BY day
    `) as ActivityRow[];

    const recentUsers = (await getSql()`
      SELECT users.id, users.email, users.role, users.name, users.given_name, users.family_name,
             users.referred_by_code AS "referredByCode",
             to_char(users.last_login_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS "lastLoginAt",
             to_char(users.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS "registeredAt"
      FROM users
      ORDER BY users.last_login_at DESC
      LIMIT 6
    `) as RecentUserRow[];

    const topReferrers = (await getSql()`
      SELECT referrer.id,
             COALESCE(
               NULLIF(trim(concat(referrer.given_name, ' ', referrer.family_name)), ''),
               referrer.name,
               referrer.email
             ) AS name,
             referrer.email,
             referrer.referral_code AS "referralCode",
             COUNT(referred.id) AS referrals
      FROM users AS referred
      JOIN users AS referrer ON referrer.referral_code = referred.referred_by_code
      GROUP BY referrer.id, referrer.given_name, referrer.family_name, referrer.name, referrer.email, referrer.referral_code
      ORDER BY referrals DESC, referrer.created_at ASC
      LIMIT 5
    `) as TopReferrerRow[];

    const overview = overviewRows[0];
    const totalUsers = toNumber(overview?.totalUsers ?? 0);
    const verifiedUsers = toNumber(overview?.verifiedUsers ?? 0);
    const referredUsers = toNumber(overview?.referredUsers ?? 0);

    return NextResponse.json({
      data: {
        overview: {
          totalUsers,
          verifiedUsers,
          loginsToday: toNumber(overview?.loginsToday ?? 0),
          newUsersToday: toNumber(overview?.newUsersToday ?? 0),
          referredUsers,
          referralShare: totalUsers > 0 ? Math.round((referredUsers / totalUsers) * 100) : 0,
          verifiedShare: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
        },
        activity: activityRows.map((row) => ({
          label: row.label,
          signups: toNumber(row.signups),
          logins: toNumber(row.logins),
          referredSignups: toNumber(row.referredSignups),
        })),
        recentUsers: recentUsers.map((user) => ({
          id: user.id,
          name: toDisplayName(user),
          email: user.email,
          role: user.role,
          lastLoginAt: user.lastLoginAt,
          registeredAt: user.registeredAt,
          referredByCode: user.referredByCode,
        })),
        topReferrers: topReferrers.map((user) => ({
          id: user.id,
          name: user.name ?? user.email,
          email: user.email,
          referralCode: user.referralCode,
          referrals: toNumber(user.referrals),
        })),
      },
    });
  } catch (error) {
    logError('dashboard', ErrorCode.DB_QUERY_FAILED, {}, error);
    return errorResponse('Could not load dashboard metrics', 500, ErrorCode.DB_QUERY_FAILED);
  }
}
