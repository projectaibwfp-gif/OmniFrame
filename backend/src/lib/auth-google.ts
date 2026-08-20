import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { logInfo } from './logger';
import {
  signSessionToken,
  toSessionPayload,
  verifyGoogleToken,
  setAccessCookie,
  setRefreshCookie,
} from './auth-session';

export async function issueSessionCookie(response: NextResponse, token: string): Promise<void> {
  const googleToken = await verifyGoogleToken(token);
  const accessToken = await signSessionToken(toSessionPayload(googleToken, 'access'));
  const refreshToken = await signSessionToken(toSessionPayload(googleToken, 'refresh'));
  setAccessCookie(response, accessToken);
  setRefreshCookie(response, refreshToken);
  logInfo('auth.login', 'session issued', { sub: googleToken.sub, email: googleToken.email });
}

export function createLoginState(): string {
  return randomBytes(32).toString('hex');
}
