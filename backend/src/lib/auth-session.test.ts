import { NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequest } from '@/test/http';

const sessionVersionMocks = vi.hoisted(() => ({
  incrementSessionVersion: vi.fn(),
  readSessionVersion: vi.fn(),
}));

vi.mock('./session-version', () => sessionVersionMocks);

import {
  refreshSessionCookie,
  revokeSessionsFromRequest,
  signSessionToken,
  toSessionPayload,
} from './auth-session';

const GOOGLE_ID = 'google-1';
const REFRESH_COOKIE_NAME = 'omniframe.refresh';
const TOKEN_SESSION_VERSION = 2;

async function requestWithRefreshToken(): Promise<ReturnType<typeof createRequest>> {
  const token = await signSessionToken(
    toSessionPayload(
      { sub: GOOGLE_ID, email: 'anna@example.com' },
      'refresh',
      TOKEN_SESSION_VERSION,
    ),
  );
  return createRequest('http://localhost/api/auth/refresh', {
    method: 'POST',
    headers: { cookie: `${REFRESH_COOKIE_NAME}=${token}` },
  });
}

describe('refreshSessionCookie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('issues new cookies when the session version still matches', async () => {
    sessionVersionMocks.readSessionVersion.mockResolvedValue(TOKEN_SESSION_VERSION);
    const response = NextResponse.json({});

    const session = await refreshSessionCookie(await requestWithRefreshToken(), response);

    expect(session.sub).toBe(GOOGLE_ID);
    expect(response.cookies.get(REFRESH_COOKIE_NAME)?.value).toBeTruthy();
  });

  it('rejects a refresh token revoked by a newer session version', async () => {
    sessionVersionMocks.readSessionVersion.mockResolvedValue(TOKEN_SESSION_VERSION + 1);

    await expect(
      refreshSessionCookie(await requestWithRefreshToken(), NextResponse.json({})),
    ).rejects.toThrow('revoked');
  });

  it('rejects a refresh token of a deleted user', async () => {
    sessionVersionMocks.readSessionVersion.mockResolvedValue(null);

    await expect(
      refreshSessionCookie(await requestWithRefreshToken(), NextResponse.json({})),
    ).rejects.toThrow('revoked');
  });
});

describe('revokeSessionsFromRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bumps the session version of the refresh token owner', async () => {
    await revokeSessionsFromRequest(await requestWithRefreshToken());

    expect(sessionVersionMocks.incrementSessionVersion).toHaveBeenCalledWith(GOOGLE_ID);
  });

  it('skips revocation without a refresh cookie', async () => {
    await revokeSessionsFromRequest(createRequest('http://localhost/api/auth/logout'));

    expect(sessionVersionMocks.incrementSessionVersion).not.toHaveBeenCalled();
  });
});

describe('assertSessionSecretsConfigured', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('fails in production without session secrets', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SESSION_JWT_SECRET', '');
    vi.resetModules();
    const { assertSessionSecretsConfigured } = await import('./auth-session');

    expect(() => assertSessionSecretsConfigured()).toThrow('SESSION_JWT_SECRET');
  });

  it('accepts configured secrets in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SESSION_JWT_SECRET', 'session-secret');
    vi.stubEnv('SESSION_REFRESH_SECRET', 'refresh-secret');
    vi.resetModules();
    const { assertSessionSecretsConfigured } = await import('./auth-session');

    expect(() => assertSessionSecretsConfigured()).not.toThrow();
  });
});
