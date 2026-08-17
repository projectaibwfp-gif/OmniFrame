import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
}));

const dbMocks = vi.hoisted(() => ({
  getSql: vi.fn(),
  sql: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  isAuthDenied: authMocks.isAuthDenied,
  requireAuth: authMocks.requireAuth,
}));

vi.mock('@/lib/db', () => ({
  getSql: dbMocks.getSql,
}));

import { GET } from './route';

describe('GET /api/dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
    dbMocks.getSql.mockReturnValue(dbMocks.sql);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(createRequest('http://localhost/api/dashboard'));

    expect(response.status).toBe(401);
  });

  it('returns aggregated dashboard metrics', async () => {
    dbMocks.sql
      .mockResolvedValueOnce([
        {
          totalUsers: '10',
          verifiedUsers: '8',
          loginsToday: '4',
          newUsersToday: '2',
          referredUsers: '3',
        },
      ])
      .mockResolvedValueOnce([
        { label: '11.08', signups: '1', logins: '3', referredSignups: '0' },
        { label: '12.08', signups: '2', logins: '4', referredSignups: '1' },
      ])
      .mockResolvedValueOnce([
        {
          id: 5,
          email: 'anna@example.com',
          role: 'user',
          name: 'Anna',
          given_name: 'Anna',
          family_name: 'Nowak',
          lastLoginAt: '2026-08-17 12:00',
          registeredAt: '2026-08-17 11:00',
          referredByCode: 'ref-1',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 2,
          name: 'Jan Kowalski',
          email: 'jan@example.com',
          referralCode: 'ref-1',
          referrals: '6',
        },
      ]);

    const response = await GET(createRequest('http://localhost/api/dashboard'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        overview: {
          totalUsers: 10,
          verifiedUsers: 8,
          loginsToday: 4,
          newUsersToday: 2,
          referredUsers: 3,
          referralShare: 30,
          verifiedShare: 80,
        },
        activity: [
          { label: '11.08', signups: 1, logins: 3, referredSignups: 0 },
          { label: '12.08', signups: 2, logins: 4, referredSignups: 1 },
        ],
        recentUsers: [
          {
            id: 5,
            name: 'Anna Nowak',
            email: 'anna@example.com',
            role: 'user',
            lastLoginAt: '2026-08-17 12:00',
            registeredAt: '2026-08-17 11:00',
            referredByCode: 'ref-1',
          },
        ],
        topReferrers: [
          {
            id: 2,
            name: 'Jan Kowalski',
            email: 'jan@example.com',
            referralCode: 'ref-1',
            referrals: 6,
          },
        ],
      },
    });
  });

  it('returns 500 when metrics query fails', async () => {
    dbMocks.sql.mockRejectedValue(new Error('db down'));

    const response = await GET(createRequest('http://localhost/api/dashboard'));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: {
        message: 'Could not load dashboard metrics',
      },
    });
  });
});
