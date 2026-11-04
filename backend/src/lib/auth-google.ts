import { randomBytes } from 'node:crypto';
import type { NextResponse } from 'next/server';
import { logInfo } from './logger';
import { setSessionCookies, type GoogleTokenPayload } from './auth-session';

export async function issueSessionCookie(
  response: NextResponse,
  googleToken: GoogleTokenPayload,
  sessionVersion: number,
): Promise<void> {
  await setSessionCookies(response, googleToken, sessionVersion);
  logInfo('auth.login', 'session issued', { sub: googleToken.sub });
}

export function createLoginState(): string {
  return randomBytes(32).toString('hex');
}
