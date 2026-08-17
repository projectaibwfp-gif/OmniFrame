import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createJsonRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  clearLoginState: vi.fn(),
  isLoginStateValid: vi.fn(),
  issueSessionCookie: vi.fn(),
  upsertGoogleUser: vi.fn(),
  verifyGoogleToken: vi.fn(),
}));

const referralMocks = vi.hoisted(() => ({
  clearPendingReferral: vi.fn(),
  getPendingReferral: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  clearLoginState: authMocks.clearLoginState,
  isLoginStateValid: authMocks.isLoginStateValid,
  issueSessionCookie: authMocks.issueSessionCookie,
  upsertGoogleUser: authMocks.upsertGoogleUser,
  verifyGoogleToken: authMocks.verifyGoogleToken,
}));

vi.mock('@/lib/referral', () => ({
  clearPendingReferral: referralMocks.clearPendingReferral,
  getPendingReferral: referralMocks.getPendingReferral,
}));

import { POST } from './route';

describe('POST /api/auth/google', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.isLoginStateValid.mockReturnValue(true);
    referralMocks.getPendingReferral.mockReturnValue(null);
  });

  it('returns 400 for invalid json body', async () => {
    const response = await POST(createJsonRequest('http://localhost/api/auth/google', 'POST', '{'));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        message: 'Request body must be valid JSON',
      },
    });
  });

  it('returns 403 when login state is invalid', async () => {
    authMocks.isLoginStateValid.mockReturnValue(false);

    const response = await POST(
      createJsonRequest('http://localhost/api/auth/google', 'POST', {
        credential: 'token',
        state: 'bad-state',
      }),
    );

    expect(response.status).toBe(403);
    expect(authMocks.clearLoginState).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toEqual({
      error: {
        message: 'Invalid login state',
      },
    });
  });

  it('logs in google user and clears state cookies', async () => {
    authMocks.verifyGoogleToken.mockResolvedValue({
      sub: 'google-1',
      email: 'anna@example.com',
    });
    authMocks.upsertGoogleUser.mockResolvedValue({
      user: {
        given_name: 'Anna',
        family_name: 'Nowak',
        name: 'Anna Nowak',
        email: 'anna@example.com',
        picture: null,
        role: 'user',
        referralCode: 'abc123',
        referredByCode: 'ref-1',
      },
    });
    referralMocks.getPendingReferral.mockReturnValue({ code: 'ref-1' });

    const response = await POST(
      createJsonRequest('http://localhost/api/auth/google', 'POST', {
        credential: 'google-token',
        state: 'ok-state',
      }),
    );

    expect(response.status).toBe(200);
    expect(authMocks.upsertGoogleUser).toHaveBeenCalledWith(
      { sub: 'google-1', email: 'anna@example.com' },
      'ref-1',
    );
    expect(authMocks.issueSessionCookie).toHaveBeenCalledWith(response, 'google-token');
    expect(authMocks.clearLoginState).toHaveBeenCalledWith(response);
    expect(referralMocks.clearPendingReferral).toHaveBeenCalledWith(response);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        user: {
          email: 'anna@example.com',
          role: 'user',
          referralCode: 'abc123',
          referredByCode: 'ref-1',
        },
      },
    });
  });

  it('returns 401 when google verification fails', async () => {
    authMocks.verifyGoogleToken.mockRejectedValue(new Error('bad token'));

    const response = await POST(
      createJsonRequest('http://localhost/api/auth/google', 'POST', {
        credential: 'google-token',
        state: 'ok-state',
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: {
        message: 'bad token',
      },
    });
  });
});
