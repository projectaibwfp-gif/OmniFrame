import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
}));

const profileMocks = vi.hoisted(() => ({
  getCurrentUserProfile: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  isAuthDenied: authMocks.isAuthDenied,
  requireAuth: authMocks.requireAuth,
}));

vi.mock('@/lib/profile', () => ({
  getCurrentUserProfile: profileMocks.getCurrentUserProfile,
}));

import { GET } from './route';

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('returns the current user when session exists', async () => {
    profileMocks.getCurrentUserProfile.mockResolvedValue({
      email: 'anna@example.com',
      role: 'user',
    });

    const response = await GET(createRequest('http://localhost/api/auth/me'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        user: {
          email: 'anna@example.com',
          role: 'user',
        },
      },
    });
  });

  it('passes through denied responses from auth layer', async () => {
    const denied = NextResponse.json(
      { error: { message: 'Authentication required' } },
      { status: 401 },
    );
    authMocks.requireAuth.mockResolvedValue({ response: denied });

    const response = await GET(createRequest('http://localhost/api/auth/me'));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: {
        message: 'Authentication required',
      },
    });
  });

  it('returns 500 when session lookup throws', async () => {
    profileMocks.getCurrentUserProfile.mockRejectedValue(new Error('boom'));

    const response = await GET(createRequest('http://localhost/api/auth/me'));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Could not load current session',
      },
    });
  });
});
