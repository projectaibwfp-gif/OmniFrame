import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
  clearSessionCookie: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  clearSessionCookie: authMocks.clearSessionCookie,
}));

import { POST } from './route';

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns success payload', async () => {
    const response = await POST();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        success: true,
      },
    });
  });

  it('clears the session cookies on logout', async () => {
    const response = await POST();

    expect(authMocks.clearSessionCookie).toHaveBeenCalledTimes(1);
    expect(authMocks.clearSessionCookie).toHaveBeenCalledWith(response);
  });
});
