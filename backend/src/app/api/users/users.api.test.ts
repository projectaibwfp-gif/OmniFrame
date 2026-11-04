import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createJsonRequest, createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAdmin: vi.fn(),
  upsertUser: vi.fn(),
}));

const dbMocks = vi.hoisted(() => ({
  getSql: vi.fn(),
  sql: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  isAuthDenied: authMocks.isAuthDenied,
  requireAdmin: authMocks.requireAdmin,
  upsertUser: authMocks.upsertUser,
}));

vi.mock('@/lib/db', () => ({
  getSql: dbMocks.getSql,
}));

import { GET, POST } from './route';

describe('Users API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAdmin.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
    dbMocks.getSql.mockReturnValue(dbMocks.sql);
  });

  it('denies unauthenticated GET /api/users', async () => {
    authMocks.requireAdmin.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(createRequest('http://localhost/api/users'));

    expect(response.status).toBe(401);
  });

  it('denies non-admin POST /api/users', async () => {
    authMocks.requireAdmin.mockResolvedValue({
      response: createDeniedResponse(403, 'Admin role required'),
    });

    const response = await POST(
      createJsonRequest('http://localhost/api/users', 'POST', {
        googleId: 'google-1',
        email: 'anna@example.com',
        role: 'admin',
      }),
    );

    expect(response.status).toBe(403);
    expect(authMocks.upsertUser).not.toHaveBeenCalled();
  });

  it('rejects a role outside the allowed list in POST /api/users', async () => {
    const response = await POST(
      createJsonRequest('http://localhost/api/users', 'POST', {
        googleId: 'google-1',
        email: 'anna@example.com',
        role: 'owner',
      }),
    );

    expect(response.status).toBe(400);
    expect(authMocks.upsertUser).not.toHaveBeenCalled();
  });

  it('validates email in POST /api/users', async () => {
    const response = await POST(
      createJsonRequest('http://localhost/api/users', 'POST', {
        googleId: 'google-1',
        email: 'bad-mail',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Request body is invalid: email: has invalid format',
      },
    });
  });

  it('upserts user data in POST /api/users', async () => {
    authMocks.upsertUser.mockResolvedValue({
      user: {
        googleId: 'google-1',
        email: 'anna@example.com',
        role: 'moderator',
      },
    });

    const response = await POST(
      createJsonRequest('http://localhost/api/users', 'POST', {
        googleId: 'google-1',
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
        googleId: 'google-1',
        email: 'anna@example.com',
        role: 'moderator',
      },
    });
  });
});
