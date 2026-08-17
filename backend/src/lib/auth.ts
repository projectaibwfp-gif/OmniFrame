import { createHash, randomBytes } from 'node:crypto';
import { SignJWT, createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from './api-response';
import { getSql } from './db';

export type UserRole = 'admin' | 'user' | 'moderator';

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

interface SessionTokenPayload extends GoogleTokenPayload {
  token_use: 'access' | 'refresh';
}

export interface AuthenticatedUser {
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
  registeredAt: string;
  lastLoginAt: string;
}

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
  referral_code: string;
  referred_by_code: string | null;
  last_login_at: string;
  created_at: string;
  updated_at: string;
}

export type AuthCheckResult = { session: SessionTokenPayload } | { response: NextResponse };

export function isAuthDenied(auth: AuthCheckResult): auth is { response: NextResponse } {
  return 'response' in auth;
}

export interface UpsertUserInput {
  google_id: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
  referred_by_code?: string | null;
  role?: UserRole;
}

interface UpsertUserRow extends UserRow {
  was_created: boolean;
}

export interface UpsertUserResult {
  user: AuthenticatedUser;
  wasCreated: boolean;
}

const ACCESS_COOKIE_NAME = 'omniframe.session';
const REFRESH_COOKIE_NAME = 'omniframe.refresh';
const OAUTH_STATE_COOKIE_NAME = 'omniframe.oauth_state';
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const SESSION_ISSUER = 'omniframe';
const SESSION_AUDIENCE = 'omniframe-web';
const ACCESS_TOKEN_TTL_SECONDS = 30 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const OAUTH_STATE_TTL_SECONDS = 10 * 60;
const DEFAULT_GOOGLE_CLIENT_ID =
  '181921852616-kqff26dgukqpg5o46ulkik3ir2hcri4r.apps.googleusercontent.com';
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

function mapUserRow(row: UserRow): AuthenticatedUser {
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
    referralCode: row.referral_code,
    referredByCode: row.referred_by_code,
    registeredAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}

function generateReferralCode(googleId: string): string {
  return createHash('md5').update(googleId).digest('hex');
}

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_JWT_SECRET?.trim() || DEFAULT_SESSION_SECRET;
  return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.SESSION_REFRESH_SECRET?.trim() || DEFAULT_REFRESH_SECRET;
  return new TextEncoder().encode(secret);
}

function setAccessCookie(response: NextResponse, token: string): void {
  response.cookies.set(ACCESS_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });
}

function setRefreshCookie(response: NextResponse, token: string): void {
  response.cookies.set(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
}

function clearAccessCookie(response: NextResponse): void {
  response.cookies.set(ACCESS_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
}

function clearRefreshCookie(response: NextResponse): void {
  response.cookies.set(REFRESH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
}

function setOAuthStateCookie(response: NextResponse, state: string): void {
  response.cookies.set(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: OAUTH_STATE_TTL_SECONDS,
  });
}

function clearOAuthStateCookie(response: NextResponse): void {
  response.cookies.set(OAUTH_STATE_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(0),
  });
}

function toSessionPayload(payload: GoogleTokenPayload, tokenUse: 'access' | 'refresh'): SessionTokenPayload {
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

async function signSessionToken(payload: SessionTokenPayload): Promise<string> {
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

async function verifySessionToken(
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

export async function upsertUser(input: UpsertUserInput): Promise<UpsertUserResult> {
  const referralCode = generateReferralCode(input.google_id);
  const rows = (await getSql()`
    WITH inserted AS (
     INSERT INTO users (
       google_id,
       email,
       email_verified,
       role,
       name,
       given_name,
       family_name,
       picture,
       locale,
       referral_code,
       referred_by_code,
       last_login_at
     )
     VALUES (
       ${input.google_id},
       ${input.email},
       ${input.email_verified ?? false},
       ${input.role ?? 'user'},
       ${input.name ?? null},
       ${input.given_name ?? null},
       ${input.family_name ?? null},
       ${input.picture ?? null},
       ${input.locale ?? null},
       ${referralCode},
       ${input.referred_by_code ?? null},
       now()
     )
     ON CONFLICT (google_id) DO NOTHING
     RETURNING id, google_id, email, email_verified, role, name,
               given_name, family_name, picture, locale, referral_code, referred_by_code,
               last_login_at, created_at, updated_at,
               true AS was_created
    ),
    recorded_referral AS (
     INSERT INTO user_referral_attributions (user_id, referral_code)
     SELECT id, ${input.referred_by_code ?? null}
     FROM inserted
     WHERE ${input.referred_by_code ?? null} IS NOT NULL
     RETURNING user_id
    ),
    updated AS (
     UPDATE users
     SET email          = ${input.email},
         email_verified = ${input.email_verified ?? false},
         role           = ${input.role ?? 'user'},
         name           = ${input.name ?? null},
         given_name     = ${input.given_name ?? null},
         family_name    = ${input.family_name ?? null},
         picture        = ${input.picture ?? null},
         locale         = ${input.locale ?? null},
        referral_code  = COALESCE(referral_code, ${referralCode}),
        last_login_at  = now(),
        updated_at     = now()
     WHERE google_id = ${input.google_id}
       AND NOT EXISTS (SELECT 1 FROM inserted)
     RETURNING id, google_id, email, email_verified, role, name,
               given_name, family_name, picture, locale, referral_code, referred_by_code,
               last_login_at, created_at, updated_at,
               false AS was_created
    )
    SELECT id, google_id, email, email_verified, role, name,
          given_name, family_name, picture, locale, referral_code, referred_by_code,
          last_login_at, created_at, updated_at, was_created
    FROM inserted
    UNION ALL
    SELECT id, google_id, email, email_verified, role, name,
          given_name, family_name, picture, locale, referral_code, referred_by_code,
          last_login_at, created_at, updated_at, was_created
    FROM updated
  `) as UpsertUserRow[];

  return {
    user: mapUserRow(rows[0]),
    wasCreated: rows[0].was_created,
  };
}

export async function upsertGoogleUser(
  payload: GoogleTokenPayload,
  referredByCode?: string | null,
  role?: UserRole,
): Promise<UpsertUserResult> {
  return upsertUser({
    google_id: payload.sub,
    email: payload.email,
    email_verified: payload.email_verified,
    name: payload.name,
    given_name: payload.given_name,
    family_name: payload.family_name,
    picture: payload.picture,
    locale: payload.locale,
    referred_by_code: referredByCode,
    role,
  });
}

export async function issueSessionCookie(response: NextResponse, token: string): Promise<void> {
  const googleToken = await verifyGoogleToken(token);
  const accessToken = await signSessionToken(toSessionPayload(googleToken, 'access'));
  const refreshToken = await signSessionToken(toSessionPayload(googleToken, 'refresh'));
  setAccessCookie(response, accessToken);
  setRefreshCookie(response, refreshToken);
}

export function createLoginState(): string {
  return randomBytes(32).toString('hex');
}

export function storeLoginState(response: NextResponse, state: string): void {
  setOAuthStateCookie(response, state);
}

export function isLoginStateValid(request: NextRequest, providedState: string): boolean {
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value;
  if (!expectedState || !providedState) {
    return false;
  }
  return expectedState === providedState;
}

export function clearLoginState(response: NextResponse): void {
  clearOAuthStateCookie(response);
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
  return session;
}

export function clearSessionCookie(response: NextResponse): void {
  clearAccessCookie(response);
  clearRefreshCookie(response);
  clearOAuthStateCookie(response);
}

export async function requireAuth(request: NextRequest): Promise<AuthCheckResult> {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  if (!token) {
    return { response: errorResponse('Authentication required', 401) };
  }

  try {
    const session = await verifySessionToken(token, 'access');
    return { session };
  } catch {
    const response = errorResponse('Authentication required', 401);
    clearAccessCookie(response);
    return { response };
  }
}

export async function loadCurrentUser(request: NextRequest): Promise<AuthenticatedUser | NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const rows = (await getSql()`
    SELECT id, google_id, email, email_verified, role, name,
           given_name, family_name, picture, locale, referral_code, referred_by_code,
           last_login_at, created_at, updated_at
    FROM users
    WHERE google_id = ${auth.session.sub}
    LIMIT 1
  `) as UserRow[];

  if (rows.length > 0) {
    return mapUserRow(rows[0]);
  }

  return {
    id: 0,
    google_id: auth.session.sub,
    email: auth.session.email,
    email_verified: auth.session.email_verified === true,
    role: 'user',
    name: auth.session.name ?? null,
    given_name: auth.session.given_name ?? null,
    family_name: auth.session.family_name ?? null,
    picture: auth.session.picture ?? null,
    locale: auth.session.locale ?? null,
    referralCode: generateReferralCode(auth.session.sub),
    referredByCode: null,
    registeredAt: '',
    lastLoginAt: '',
  };
}
