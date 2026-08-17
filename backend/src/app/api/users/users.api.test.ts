import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createJsonRequest, createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
  upsertUser: vi.fn(),
}));

const dbMocks = vi.hoisted(() => ({
  getSql: vi.fn(),
  sql: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  isAuthDenied: authMocks.isAuthDenied,
  requireAuth: authMocks.requireAuth,
  upsertUser: authMocks.upsertUser,
}));

vi.mock('@/lib/db', () => ({
  getSql: dbMocks.getSql,
}));

import { GET, POST } from './route';

describe('Users API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
    dbMocks.getSql.mockReturnValue(dbMocks.sql);
  });

  it('denies unauthenticated GET /api/users', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(createRequest('http://localhost/api/users'));

    expect(response.status).toBe(401);
  });

  it('returns a single user when google_id filter is provided', async () => {
    dbMocks.sql.mockResolvedValue([
      {
        id: 1,
        google_id: 'google-1',
        email: 'anna@example.com',
        email_verified: true,
        role: 'user',
        name: 'Anna',
        given_name: 'Anna',
        family_name: 'Nowak',
        picture: null,
        locale: 'pl',
        referralCode: 'abc',
        referredByCode: null,
        referredByName: null,
        registeredAt: '2026-08-17 10:00',
        lastLoginAt: '2026-08-17 11:00',
      },
    ]);

    const response = await GET(createRequest('http://localhost/api/users?google_id=google-1'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        google_id: 'google-1',
        email: 'anna@example.com',
      },
    });
  });

  it('validates email in POST /api/users', async () => {
    const response = await POST(
      createJsonRequest('http://localhost/api/users', 'POST', {
        google_id: 'google-1',
        email: 'bad-mail',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'A valid email is required',
      },
    });
  });

  it('upserts user data in POST /api/users', async () => {
    authMocks.upsertUser.mockResolvedValue({
      user: {
        google_id: 'google-1',
        email: 'anna@example.com',
        role: 'moderator',
      },
    });

    const response = await POST(
      createJsonRequest('http://localhost/api/users', 'POST', {
        google_id: 'google-1',
        email: 'anna@example.com',
        role: 'moderator',
      }),
    );

    expect(response.status).toBe(200);
    expect(authMocks.upsertUser).toHaveBeenCalledWith({
      google_id: 'google-1',
      email: 'anna@example.com',
      email_verified: undefined,
      name: undefined,
      given_name: undefined,
      family_name: undefined,
      picture: undefined,
      locale: undefined,
      role: 'moderator',
    });
    await expect(response.json()).resolves.toEqual({
      data: {
        google_id: 'google-1',
        email: 'anna@example.com',
        role: 'moderator',
      },
    });
  });
});
