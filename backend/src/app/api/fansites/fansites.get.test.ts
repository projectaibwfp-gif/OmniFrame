import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
}));

const tibiadataMocks = vi.hoisted(() => ({
  fetchFansites: vi.fn(),
}));

const tibiadataCoreMocks = vi.hoisted(() => ({
  TibiaDataNotFoundError: class TibiaDataNotFoundError extends Error {},
}));

vi.mock('@/lib/auth', () => authMocks);
vi.mock('@/lib/tibiadata', () => tibiadataCoreMocks);
vi.mock('@/lib/tibiadata-extra', () => tibiadataMocks);

import { GET } from './route';

describe('GET /api/fansites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(createRequest('http://localhost/api/fansites'));

    expect(response.status).toBe(401);
    expect(tibiadataMocks.fetchFansites).not.toHaveBeenCalled();
  });

  it('returns promoted and supported fansites', async () => {
    const data = {
      promoted: [
        {
          contact: null,
          contentType: null,
          fansiteItem: false,
          fansiteItemUrl: null,
          homepage: 'https://example.com',
          languages: ['en'],
          logoUrl: 'https://example.com/logo.png',
          name: 'Example Fansite',
          socialMedia: null,
          specials: [],
        },
      ],
      supported: [],
    };
    tibiadataMocks.fetchFansites.mockResolvedValue(data);

    const response = await GET(createRequest('http://localhost/api/fansites'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data });
  });

  it('returns 404 when TibiaData reports missing fansites', async () => {
    tibiadataMocks.fetchFansites.mockRejectedValue(
      new tibiadataCoreMocks.TibiaDataNotFoundError('Fansites not found'),
    );

    const response = await GET(createRequest('http://localhost/api/fansites'));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'NOT_FOUND', message: 'fansites not found' },
    });
  });

  it('returns 502 when upstream request fails', async () => {
    tibiadataMocks.fetchFansites.mockRejectedValue(new Error('upstream down'));

    const response = await GET(createRequest('http://localhost/api/fansites'));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Could not load fansites' },
    });
  });
});
