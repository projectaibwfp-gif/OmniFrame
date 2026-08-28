import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
}));

const userMocks = vi.hoisted(() => ({
  getUserByGoogleId: vi.fn(),
}));

vi.mock('@/lib/auth', () => authMocks);
vi.mock('@/lib/users', () => userMocks);

import { GET } from './route';

const params = (googleId: string) => ({ params: Promise.resolve({ googleId }) });

describe('GET /api/users/:googleId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'admin-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(
      createRequest('http://localhost/api/users/google-1'),
      params('google-1'),
    );

    expect(response.status).toBe(401);
  });

  it('returns the requested user', async () => {
    userMocks.getUserByGoogleId.mockResolvedValue({
      id: 1,
      googleId: 'google-1',
      email: 'anna@example.com',
    });

    const response = await GET(
      createRequest('http://localhost/api/users/google-1'),
      params('google-1'),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: { id: 1, googleId: 'google-1', email: 'anna@example.com' },
    });
    expect(userMocks.getUserByGoogleId).toHaveBeenCalledWith('google-1');
  });

  it('returns 404 when the user does not exist', async () => {
    userMocks.getUserByGoogleId.mockResolvedValue(null);

    const response = await GET(
      createRequest('http://localhost/api/users/missing'),
      params('missing'),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'NOT_FOUND', message: 'User not found' },
    });
  });
});
