import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
}));

const tibiadataMocks = vi.hoisted(() => ({
  fetchGuilds: vi.fn(),
}));

const tibiadataCoreMocks = vi.hoisted(() => ({
  TibiaDataNotFoundError: class TibiaDataNotFoundError extends Error {},
}));

vi.mock('@/lib/auth', () => authMocks);
vi.mock('@/lib/tibiadata', () => tibiadataCoreMocks);
vi.mock('@/lib/tibiadata-extra', () => tibiadataMocks);

import { GET } from './route';

const params = (world: string) => ({ params: Promise.resolve({ world }) });

describe('GET /api/guilds/:world', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(createRequest('http://localhost/api/guilds/Dia'), params('Dia'));

    expect(response.status).toBe(401);
    expect(tibiadataMocks.fetchGuilds).not.toHaveBeenCalled();
  });

  it('returns guilds overview for a world', async () => {
    const data = {
      active: [{ description: null, logoUrl: null, name: 'Red Rose' }],
      formation: [],
      world: 'Dia',
    };
    tibiadataMocks.fetchGuilds.mockResolvedValue(data);

    const response = await GET(createRequest('http://localhost/api/guilds/Dia'), params('Dia'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data });
    expect(tibiadataMocks.fetchGuilds).toHaveBeenCalledWith('Dia');
  });

  it('returns 400 for invalid world param', async () => {
    const response = await GET(
      createRequest('http://localhost/api/guilds/world'),
      params('x'.repeat(31)),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'VALIDATION_FAILED' },
    });
  });

  it('returns 404 when TibiaData reports missing guilds', async () => {
    tibiadataMocks.fetchGuilds.mockRejectedValue(
      new tibiadataCoreMocks.TibiaDataNotFoundError('Guilds not found'),
    );

    const response = await GET(createRequest('http://localhost/api/guilds/Dia'), params('Dia'));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'NOT_FOUND', message: 'guilds not found' },
    });
  });

  it('returns 502 when upstream request fails', async () => {
    tibiadataMocks.fetchGuilds.mockRejectedValue(new Error('upstream down'));

    const response = await GET(createRequest('http://localhost/api/guilds/Dia'), params('Dia'));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Could not load guilds' },
    });
  });
});
