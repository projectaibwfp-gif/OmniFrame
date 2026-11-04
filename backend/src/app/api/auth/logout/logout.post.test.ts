import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  clearSessionCookie: vi.fn(),
  revokeSessionsFromRequest: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  clearSessionCookie: authMocks.clearSessionCookie,
  revokeSessionsFromRequest: authMocks.revokeSessionsFromRequest,
}));

function logoutRequest() {
  return createRequest('http://localhost/api/auth/logout', { method: 'POST' });
}

import { POST } from './route';

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns success payload', async () => {
    const response = await POST(logoutRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        success: true,
      },
    });
  });

  it('revokes the sessions of the requesting user', async () => {
    const request = logoutRequest();

    await POST(request);

    expect(authMocks.revokeSessionsFromRequest).toHaveBeenCalledWith(request);
  });

  it('clears the session cookies on logout', async () => {
    const response = await POST(logoutRequest());

    expect(authMocks.clearSessionCookie).toHaveBeenCalledTimes(1);
    expect(authMocks.clearSessionCookie).toHaveBeenCalledWith(response);
  });
});
