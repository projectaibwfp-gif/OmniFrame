import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
}));

const tibiadataMocks = vi.hoisted(() => ({
  fetchKillStatistics: vi.fn(),
  TibiaDataNotFoundError: class TibiaDataNotFoundError extends Error {},
}));

vi.mock('@/lib/auth', () => authMocks);
vi.mock('@/lib/tibiadata', () => tibiadataMocks);

import { GET } from './route';

const params = (world: string) => ({ params: Promise.resolve({ world }) });

describe('GET /api/killstatistics/:world', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(
      createRequest('http://localhost/api/killstatistics/Dia'),
      params('Dia'),
    );

    expect(response.status).toBe(401);
    expect(tibiadataMocks.fetchKillStatistics).not.toHaveBeenCalled();
  });

  it('returns world statistics', async () => {
    const data = {
      world: 'Dia',
      updatedAt: null,
      entries: [],
    };
    tibiadataMocks.fetchKillStatistics.mockResolvedValue(data);

    const response = await GET(
      createRequest('http://localhost/api/killstatistics/Dia'),
      params('Dia'),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data });
    expect(tibiadataMocks.fetchKillStatistics).toHaveBeenCalledWith('Dia');
  });

  it('returns 502 when upstream request fails', async () => {
    tibiadataMocks.fetchKillStatistics.mockRejectedValue(new Error('upstream down'));

    const response = await GET(
      createRequest('http://localhost/api/killstatistics/Dia'),
      params('Dia'),
    );

    expect(response.status).toBe(502);
  });
});
