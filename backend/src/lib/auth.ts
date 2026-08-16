import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose';
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
  last_login_at: string;
  created_at: string;
  updated_at: string;
}

interface SessionClaims {
  sub: string;
  email: string;
  role: UserRole;
  name: string | null;
  given_name: string | null;
  family_name: string | null;
}

export type AuthCheckResult = { session: SessionClaims } | { response: NextResponse };

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
  role?: UserRole;
}

const AUTH_COOKIE_NAME = 'omniframe.session';
const SESSION_DURATION_SECONDS = 30 * 60;
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const DEFAULT_GOOGLE_CLIENT_ID =
  '181921852616-kqff26dgukqpg5o46ulkik3ir2hcri4r.apps.googleusercontent.com';
const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

function getGoogleClientId(): string {
  return (
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    process.env.VITE_GOOGLE_CLIENT_ID?.trim() ||
    DEFAULT_GOOGLE_CLIENT_ID
  );
}

function getSessionSecret(): string {
  const secret = process.env.AUTH_JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('AUTH_JWT_SECRET is not set');
  }

  return secret;
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
    registeredAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}

function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });
}

function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
}

async function createSessionToken(payload: SessionClaims): Promise<string> {
  const secret = new TextEncoder().encode(getSessionSecret());

  return new SignJWT({
    email: payload.email,
    role: payload.role,
    name: payload.name,
    given_name: payload.given_name,
    family_name: payload.family_name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setIssuer('omniframe')
    .setAudience('omniframe-web')
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret);
}

async function verifySessionToken(token: string): Promise<SessionClaims> {
  const secret = new TextEncoder().encode(getSessionSecret());
  const { payload } = await jwtVerify(token, secret, {
    issuer: 'omniframe',
    audience: 'omniframe-web',
  });

  if (
    typeof payload.sub !== 'string' ||
    typeof payload.email !== 'string' ||
    typeof payload.role !== 'string'
  ) {
    throw new Error('Invalid session payload');
  }

  const role = payload.role as UserRole;
  if (!['admin', 'user', 'moderator'].includes(role)) {
    throw new Error('Invalid session payload');
  }

  return {
    sub: payload.sub,
    email: payload.email,
    role,
    name: typeof payload.name === 'string' ? payload.name : null,
    given_name: typeof payload.given_name === 'string' ? payload.given_name : null,
    family_name: typeof payload.family_name === 'string' ? payload.family_name : null,
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

export async function upsertUser(input: UpsertUserInput): Promise<AuthenticatedUser> {
  const rows = (await getSql()`
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
      now()
    )
    ON CONFLICT (google_id) DO UPDATE SET
      email          = EXCLUDED.email,
      email_verified = EXCLUDED.email_verified,
      role           = EXCLUDED.role,
      name           = EXCLUDED.name,
      given_name     = EXCLUDED.given_name,
      family_name    = EXCLUDED.family_name,
      picture        = EXCLUDED.picture,
      locale         = EXCLUDED.locale,
      last_login_at  = now(),
      updated_at     = now()
    RETURNING id, google_id, email, email_verified, role, name,
              given_name, family_name, picture, locale,
              last_login_at, created_at, updated_at
  `) as UserRow[];

  return mapUserRow(rows[0]);
}

export async function upsertGoogleUser(
  payload: GoogleTokenPayload,
  role?: UserRole,
): Promise<AuthenticatedUser> {
  return upsertUser({
    google_id: payload.sub,
    email: payload.email,
    email_verified: payload.email_verified,
    name: payload.name,
    given_name: payload.given_name,
    family_name: payload.family_name,
    picture: payload.picture,
    locale: payload.locale,
    role,
  });
}

export async function issueSessionCookie(response: NextResponse, payload: SessionClaims): Promise<void> {
  const token = await createSessionToken(payload);
  setAuthCookie(response, token);
}

export function clearSessionCookie(response: NextResponse): void {
  clearAuthCookie(response);
}

export async function requireAuth(request: NextRequest): Promise<AuthCheckResult> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return { response: errorResponse('Authentication required', 401) };
  }

  try {
    const session = await verifySessionToken(token);
    return { session };
  } catch {
    const response = errorResponse('Authentication required', 401);
    clearAuthCookie(response);
    return { response };
  }
}

export async function loadCurrentUser(request: NextRequest): Promise<AuthenticatedUser | NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  return {
    id: 0,
    google_id: auth.session.sub,
    email: auth.session.email,
    email_verified: true,
    role: auth.session.role,
    name: auth.session.name,
    given_name: auth.session.given_name,
    family_name: auth.session.family_name,
    picture: null,
    locale: null,
    registeredAt: '',
    lastLoginAt: '',
  };
}
