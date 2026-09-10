import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
}));

const tibiadataMocks = vi.hoisted(() => ({
  fetchGuild: vi.fn(),
}));

const tibiadataCoreMocks = vi.hoisted(() => ({
  TibiaDataNotFoundError: class TibiaDataNotFoundError extends Error {},
}));

vi.mock('@/lib/auth', () => authMocks);
vi.mock('@/lib/tibiadata', () => tibiadataCoreMocks);
vi.mock('@/lib/tibiadata-extra', () => tibiadataMocks);

import { GET } from './route';

const params = (name: string) => ({ params: Promise.resolve({ name }) });

describe('GET /api/guild/:name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(
      createRequest('http://localhost/api/guild/Red Rose'),
      params('Red Rose'),
    );

    expect(response.status).toBe(401);
    expect(tibiadataMocks.fetchGuild).not.toHaveBeenCalled();
  });

  it('returns guild details', async () => {
    const data = {
      active: true,
      description: null,
      disbandCondition: null,
      disbandDate: null,
      founded: null,
      guildhalls: [],
      homepage: null,
      inWar: false,
      invites: [],
      logoUrl: null,
      members: [],
      membersInvited: null,
      membersTotal: 100,
      name: 'Red Rose',
      openApplications: false,
      playersOffline: 60,
      playersOnline: 40,
      world: 'Dia',
    };
    tibiadataMocks.fetchGuild.mockResolvedValue(data);

    const response = await GET(
      createRequest('http://localhost/api/guild/Red Rose'),
      params('Red Rose'),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data });
    expect(tibiadataMocks.fetchGuild).toHaveBeenCalledWith('Red Rose');
  });

  it('returns 400 for invalid name param', async () => {
    const response = await GET(
      createRequest('http://localhost/api/guild/name'),
      params('x'.repeat(101)),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'VALIDATION_FAILED' },
    });
  });

  it('returns 404 when TibiaData reports missing guild', async () => {
    tibiadataMocks.fetchGuild.mockRejectedValue(
      new tibiadataCoreMocks.TibiaDataNotFoundError('Guild not found'),
    );

    const response = await GET(
      createRequest('http://localhost/api/guild/Unknown'),
      params('Unknown'),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'NOT_FOUND', message: 'guild not found' },
    });
  });

  it('returns 502 when upstream request fails', async () => {
    tibiadataMocks.fetchGuild.mockRejectedValue(new Error('upstream down'));

    const response = await GET(
      createRequest('http://localhost/api/guild/Red Rose'),
      params('Red Rose'),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Could not load guild' },
    });
  });
});
