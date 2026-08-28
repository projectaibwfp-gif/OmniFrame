import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
}));

const tibiadataMocks = vi.hoisted(() => ({
  fetchNews: vi.fn(),
}));

vi.mock('@/lib/auth', () => authMocks);
vi.mock('@/lib/tibiadata', () => tibiadataMocks);

import { GET } from './route';

describe('GET /api/news', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(createRequest('http://localhost/api/news'));

    expect(response.status).toBe(401);
    expect(tibiadataMocks.fetchNews).not.toHaveBeenCalled();
  });

  it('returns news data', async () => {
    const data = { news: [], cachedAt: '2026-08-28T08:00:00.000Z' };
    tibiadataMocks.fetchNews.mockResolvedValue(data);

    const response = await GET(createRequest('http://localhost/api/news'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data });
  });

  it('returns 502 when upstream request fails', async () => {
    tibiadataMocks.fetchNews.mockRejectedValue(new Error('upstream down'));

    const response = await GET(createRequest('http://localhost/api/news'));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Could not load Tibia news' },
    });
  });
});
