import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  loadCurrentUser: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  loadCurrentUser: authMocks.loadCurrentUser,
}));

import { GET } from './route';

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the current user when session exists', async () => {
    authMocks.loadCurrentUser.mockResolvedValue({
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
    authMocks.loadCurrentUser.mockResolvedValue(denied);

    const response = await GET(createRequest('http://localhost/api/auth/me'));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: {
        message: 'Authentication required',
      },
    });
  });

  it('returns 500 when session lookup throws', async () => {
    authMocks.loadCurrentUser.mockRejectedValue(new Error('boom'));

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
