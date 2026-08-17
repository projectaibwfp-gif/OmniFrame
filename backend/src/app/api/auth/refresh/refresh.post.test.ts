import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  clearSessionCookie: vi.fn(),
  refreshSessionCookie: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  clearSessionCookie: authMocks.clearSessionCookie,
  refreshSessionCookie: authMocks.refreshSessionCookie,
}));

import { POST } from './route';

describe('POST /api/auth/refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refreshes the session when refresh token is valid', async () => {
    authMocks.refreshSessionCookie.mockResolvedValue(undefined);

    const response = await POST(createRequest('http://localhost/api/auth/refresh', { method: 'POST' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        refreshed: true,
      },
    });
  });

  it('returns 401 and clears cookies when refresh fails', async () => {
    authMocks.refreshSessionCookie.mockRejectedValue(new Error('expired'));

    const response = await POST(createRequest('http://localhost/api/auth/refresh', { method: 'POST' }));

    expect(response.status).toBe(401);
    expect(authMocks.clearSessionCookie).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toEqual({
      error: {
        message: 'Authentication required',
      },
    });
  });
});
