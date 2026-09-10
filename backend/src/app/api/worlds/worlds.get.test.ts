import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
}));

const tibiadataMocks = vi.hoisted(() => ({
  fetchWorlds: vi.fn(),
}));

const tibiadataCoreMocks = vi.hoisted(() => ({
  TibiaDataNotFoundError: class TibiaDataNotFoundError extends Error {},
}));

vi.mock('@/lib/auth', () => authMocks);
vi.mock('@/lib/tibiadata', () => tibiadataCoreMocks);
vi.mock('@/lib/tibiadata-extra', () => tibiadataMocks);

import { GET } from './route';

describe('GET /api/worlds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(createRequest('http://localhost/api/worlds'));

    expect(response.status).toBe(401);
    expect(tibiadataMocks.fetchWorlds).not.toHaveBeenCalled();
  });

  it('returns worlds overview', async () => {
    const data = {
      playersOnline: 500,
      recordDate: '2026-08-01',
      recordPlayers: 520,
      regularWorlds: [
        {
          battleyeDate: null,
          battleyeProtected: false,
          gameWorldType: 'regular',
          location: 'Europe',
          name: 'Dia',
          playersOnline: 100,
          premiumOnly: false,
          pvpType: 'Optional PvP',
          status: 'online',
          tournamentWorldType: null,
          transferType: 'blocked',
        },
      ],
      tournamentWorlds: [],
    };
    tibiadataMocks.fetchWorlds.mockResolvedValue(data);

    const response = await GET(createRequest('http://localhost/api/worlds'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data });
  });

  it('returns 404 when TibiaData reports missing worlds', async () => {
    tibiadataMocks.fetchWorlds.mockRejectedValue(
      new tibiadataCoreMocks.TibiaDataNotFoundError('Worlds not found'),
    );

    const response = await GET(createRequest('http://localhost/api/worlds'));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'NOT_FOUND', message: 'worlds not found' },
    });
  });

  it('returns 502 when upstream request fails', async () => {
    tibiadataMocks.fetchWorlds.mockRejectedValue(new Error('upstream down'));

    const response = await GET(createRequest('http://localhost/api/worlds'));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Could not load worlds' },
    });
  });
});
