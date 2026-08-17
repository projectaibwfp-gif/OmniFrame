import { NextRequest, NextResponse } from 'next/server';

const REFERRAL_COOKIE_NAME = 'omniframe.referral';
const REFERRAL_COOKIE_TTL_SECONDS = 30 * 24 * 60 * 60;
const REFERRAL_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,254}$/;

export interface PendingReferral {
  code: string;
}

export function normalizeReferralCode(value: string | null | undefined): string | null {
  const normalized = value?.trim() ?? '';
  if (!normalized) {
    return null;
  }

  return REFERRAL_CODE_PATTERN.test(normalized) ? normalized : null;
}

export function getPendingReferral(request: NextRequest): PendingReferral | null {
  const code = normalizeReferralCode(request.cookies.get(REFERRAL_COOKIE_NAME)?.value);
  return code ? { code } : null;
}

export function setPendingReferral(response: NextResponse, referralCode: string): void {
  response.cookies.set(REFERRAL_COOKIE_NAME, referralCode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: REFERRAL_COOKIE_TTL_SECONDS,
  });
}

export function clearPendingReferral(response: NextResponse): void {
  response.cookies.set(REFERRAL_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
}
