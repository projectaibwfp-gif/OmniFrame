import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
}));

const tibiadataMocks = vi.hoisted(() => ({
  fetchWorld: vi.fn(),
}));

const tibiadataCoreMocks = vi.hoisted(() => ({
  TibiaDataNotFoundError: class TibiaDataNotFoundError extends Error {},
}));

vi.mock('@/lib/auth', () => authMocks);
vi.mock('@/lib/tibiadata', () => tibiadataCoreMocks);
vi.mock('@/lib/tibiadata-extra', () => tibiadataMocks);

import { GET } from './route';

const params = (name: string) => ({ params: Promise.resolve({ name }) });

describe('GET /api/world/:name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(createRequest('http://localhost/api/world/Dia'), params('Dia'));

    expect(response.status).toBe(401);
    expect(tibiadataMocks.fetchWorld).not.toHaveBeenCalled();
  });

  it('returns world details', async () => {
    const data = {
      battleyeDate: null,
      battleyeProtected: false,
      creationDate: '2003-10-13',
      gameWorldType: 'regular',
      location: 'Europe',
      name: 'Dia',
      onlinePlayers: [{ level: 100, name: 'Marcin', vocation: 'Elite Knight' }],
      playersOnline: 100,
      premiumOnly: false,
      pvpType: 'Optional PvP',
      recordDate: null,
      recordPlayers: null,
      status: 'online',
      tournamentWorldType: null,
      transferType: 'blocked',
      worldQuestTitles: [],
    };
    tibiadataMocks.fetchWorld.mockResolvedValue(data);

    const response = await GET(createRequest('http://localhost/api/world/Dia'), params('Dia'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data });
    expect(tibiadataMocks.fetchWorld).toHaveBeenCalledWith('Dia');
  });

  it('returns 400 for invalid name param', async () => {
    const response = await GET(
      createRequest('http://localhost/api/world/name'),
      params('x'.repeat(101)),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'VALIDATION_FAILED' },
    });
  });

  it('returns 404 when TibiaData reports missing world', async () => {
    tibiadataMocks.fetchWorld.mockRejectedValue(
      new tibiadataCoreMocks.TibiaDataNotFoundError('World not found'),
    );

    const response = await GET(
      createRequest('http://localhost/api/world/Unknown'),
      params('Unknown'),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'NOT_FOUND', message: 'world not found' },
    });
  });

  it('returns 502 when upstream request fails', async () => {
    tibiadataMocks.fetchWorld.mockRejectedValue(new Error('upstream down'));

    const response = await GET(createRequest('http://localhost/api/world/Dia'), params('Dia'));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Could not load world' },
    });
  });
});
