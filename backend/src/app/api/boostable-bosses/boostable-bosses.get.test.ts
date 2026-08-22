import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  isAuthDenied: authMocks.isAuthDenied,
  requireAuth: authMocks.requireAuth,
}));

const tibiadataMocks = vi.hoisted(() => ({
  fetchBoostableBosses: vi.fn(),
}));

vi.mock('@/lib/tibiadata', () => ({
  fetchBoostableBosses: tibiadataMocks.fetchBoostableBosses,
}));

import { GET } from './route';

describe('GET /api/boostable-bosses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(createRequest('http://localhost/api/boostable-bosses'));

    expect(response.status).toBe(401);
  });

  it('returns boosted boss and list', async () => {
    tibiadataMocks.fetchBoostableBosses.mockResolvedValue({
      boosted: {
        name: 'Lloyd',
        imageUrl: 'https://static.tibia.com/images/library/lloyd.gif',
        featured: true,
      },
      boostableBossList: [
        {
          name: 'Lloyd',
          imageUrl: 'https://static.tibia.com/images/library/lloyd.gif',
          featured: true,
        },
        {
          name: 'Diblis the Fair',
          imageUrl: 'https://static.tibia.com/images/library/diblis_the_fair.gif',
          featured: false,
        },
      ],
    });

    const response = await GET(createRequest('http://localhost/api/boostable-bosses'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        boosted: {
          name: 'Lloyd',
          imageUrl: 'https://static.tibia.com/images/library/lloyd.gif',
          featured: true,
        },
        boostableBossList: [
          {
            name: 'Lloyd',
            imageUrl: 'https://static.tibia.com/images/library/lloyd.gif',
            featured: true,
          },
          {
            name: 'Diblis the Fair',
            imageUrl: 'https://static.tibia.com/images/library/diblis_the_fair.gif',
            featured: false,
          },
        ],
      },
    });
  });

  it('returns 502 when upstream request fails', async () => {
    tibiadataMocks.fetchBoostableBosses.mockRejectedValue(new Error('upstream down'));

    const response = await GET(createRequest('http://localhost/api/boostable-bosses'));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Could not load boostable bosses',
      },
    });
  });
});
