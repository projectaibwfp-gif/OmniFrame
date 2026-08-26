import { SignJWT, createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { NextRequest, NextResponse } from 'next/server';
import type { UserRole as SharedUserRole } from '@shared/api-contract';
import { DEFAULT_GOOGLE_CLIENT_ID } from '@shared/runtime-config';
import { errorResponse } from './api-response';
import { cookieSameSite, cookieSecure } from './cookie-config';
import { ErrorCode } from './errors';
import { logInfo, logWarn } from './logger';

export type UserRole = SharedUserRole;

export interface GoogleTokenPayload {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export interface SessionTokenPayload extends GoogleTokenPayload {
  token_use: 'access' | 'refresh';
}

export type AuthCheckResult = { session: SessionTokenPayload } | { response: NextResponse };

export function isAuthDenied(auth: AuthCheckResult): auth is { response: NextResponse } {
  return 'response' in auth;
}

const ACCESS_COOKIE_NAME = 'omniframe.session';
const REFRESH_COOKIE_NAME = 'omniframe.refresh';
const OAUTH_STATE_COOKIE_NAME = 'omniframe.oauth_state';
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const SESSION_ISSUER = 'omniframe';
const SESSION_AUDIENCE = 'omniframe-web';
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 30 * 60;
const OAUTH_STATE_TTL_SECONDS = 10 * 60;
const DEFAULT_SESSION_SECRET = 'omniframe-dev-session-secret-change-me';
const DEFAULT_REFRESH_SECRET = 'omniframe-dev-refresh-secret-change-me';
const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

function getGoogleClientId(): string {
  return (
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    process.env.VITE_GOOGLE_CLIENT_ID?.trim() ||
    DEFAULT_GOOGLE_CLIENT_ID
  );
}

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_JWT_SECRET?.trim() || DEFAULT_SESSION_SECRET;
  return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.SESSION_REFRESH_SECRET?.trim() || DEFAULT_REFRESH_SECRET;
  return new TextEncoder().encode(secret);
}

function writeCookie(
  response: NextResponse,
  name: string,
  value: string,
  options: { maxAge?: number; expires?: Date },
): void {
  response.cookies.set(name, value, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSameSite,
    path: '/',
    ...options,
  });
}

export function setAccessCookie(response: NextResponse, token: string): void {
  writeCookie(response, ACCESS_COOKIE_NAME, token, { maxAge: ACCESS_TOKEN_TTL_SECONDS });
}

export function setRefreshCookie(response: NextResponse, token: string): void {
  writeCookie(response, REFRESH_COOKIE_NAME, token, { maxAge: REFRESH_TOKEN_TTL_SECONDS });
}

function clearAccessCookie(response: NextResponse): void {
  writeCookie(response, ACCESS_COOKIE_NAME, '', { expires: new Date(0) });
}

function clearRefreshCookie(response: NextResponse): void {
  writeCookie(response, REFRESH_COOKIE_NAME, '', { expires: new Date(0) });
}

function setOAuthStateCookie(response: NextResponse, state: string): void {
  writeCookie(response, OAUTH_STATE_COOKIE_NAME, state, { maxAge: OAUTH_STATE_TTL_SECONDS });
}

function clearOAuthStateCookie(response: NextResponse): void {
  writeCookie(response, OAUTH_STATE_COOKIE_NAME, '', { expires: new Date(0) });
}

export function toSessionPayload(
  payload: GoogleTokenPayload,
  tokenUse: 'access' | 'refresh',
): SessionTokenPayload {
  return {
    sub: payload.sub,
    email: payload.email,
    email_verified: payload.email_verified === true,
    name: payload.name,
    given_name: payload.given_name,
    family_name: payload.family_name,
    picture: payload.picture,
    locale: payload.locale,
    token_use: tokenUse,
  };
}

export async function signSessionToken(payload: SessionTokenPayload): Promise<string> {
  const ttl = payload.token_use === 'access' ? ACCESS_TOKEN_TTL_SECONDS : REFRESH_TOKEN_TTL_SECONDS;
  const secret = payload.token_use === 'access' ? getSessionSecret() : getRefreshSecret();
  const claims: JWTPayload = {
    ...payload,
    token_use: payload.token_use,
  };

  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setExpirationTime(`${ttl}s`)
    .sign(secret);
}

export async function verifySessionToken(
  token: string,
  tokenUse: 'access' | 'refresh',
): Promise<SessionTokenPayload> {
  const secret = tokenUse === 'access' ? getSessionSecret() : getRefreshSecret();
  const { payload } = await jwtVerify(token, secret, {
    issuer: SESSION_ISSUER,
    audience: SESSION_AUDIENCE,
  });

  if (
    typeof payload.sub !== 'string' ||
    typeof payload.email !== 'string' ||
    payload.token_use !== tokenUse
  ) {
    throw new Error('Invalid session token payload');
  }

  return {
    sub: payload.sub,
    email: payload.email,
    email_verified: payload.email_verified === true,
    name: typeof payload.name === 'string' ? payload.name : undefined,
    given_name: typeof payload.given_name === 'string' ? payload.given_name : undefined,
    family_name: typeof payload.family_name === 'string' ? payload.family_name : undefined,
    picture: typeof payload.picture === 'string' ? payload.picture : undefined,
    locale: typeof payload.locale === 'string' ? payload.locale : undefined,
    token_use: tokenUse,
  };
}

export async function verifyGoogleToken(credential: string): Promise<GoogleTokenPayload> {
  const audience = getGoogleClientId();
  const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
    issuer: GOOGLE_ISSUERS,
    audience,
  });

  if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
    throw new Error('Invalid Google token payload');
  }

  return {
    sub: payload.sub,
    email: payload.email,
    email_verified: payload.email_verified === true,
    name: typeof payload.name === 'string' ? payload.name : undefined,
    given_name: typeof payload.given_name === 'string' ? payload.given_name : undefined,
    family_name: typeof payload.family_name === 'string' ? payload.family_name : undefined,
    picture: typeof payload.picture === 'string' ? payload.picture : undefined,
    locale: typeof payload.locale === 'string' ? payload.locale : undefined,
  };
}

export async function refreshSessionCookie(
  request: NextRequest,
  response: NextResponse,
): Promise<SessionTokenPayload> {
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  const session = await verifySessionToken(refreshToken, 'refresh');
  const nextAccessToken = await signSessionToken(toSessionPayload(session, 'access'));
  const nextRefreshToken = await signSessionToken(toSessionPayload(session, 'refresh'));
  setAccessCookie(response, nextAccessToken);
  setRefreshCookie(response, nextRefreshToken);
  logInfo('auth.refresh', 'session refreshed', { sub: session.sub });
  return session;
}

export function clearSessionCookie(response: NextResponse): void {
  clearAccessCookie(response);
  clearRefreshCookie(response);
  clearOAuthStateCookie(response);
}

export function storeLoginState(response: NextResponse, state: string): void {
  setOAuthStateCookie(response, state);
}

export function isLoginStateValid(request: NextRequest, providedState: string): boolean {
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value;
  if (!expectedState || !providedState) {
    logWarn('auth.loginState', ErrorCode.AUTH_INVALID_LOGIN_STATE, {
      hasCookieState: Boolean(expectedState),
      hasProvidedState: Boolean(providedState),
    });
    return false;
  }
  if (expectedState !== providedState) {
    logWarn('auth.loginState', ErrorCode.AUTH_INVALID_LOGIN_STATE, { reason: 'mismatch' });
    return false;
  }
  return true;
}

export function clearLoginState(response: NextResponse): void {
  clearOAuthStateCookie(response);
}

export async function requireAuth(request: NextRequest): Promise<AuthCheckResult> {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  if (!token) {
    logWarn('auth.requireAuth', ErrorCode.AUTH_REQUIRED, { reason: 'missing access token' });
    return { response: errorResponse('Authentication required', 401, ErrorCode.AUTH_REQUIRED) };
  }

  try {
    const session = await verifySessionToken(token, 'access');
    return { session };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'access token verification failed';
    logWarn('auth.requireAuth', ErrorCode.AUTH_REQUIRED, { reason: message }, error);
    const response = errorResponse('Authentication required', 401, ErrorCode.AUTH_REQUIRED);
    clearAccessCookie(response);
    return { response };
  }
}
