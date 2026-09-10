import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
}));

const tibiadataMocks = vi.hoisted(() => ({
  fetchHouses: vi.fn(),
}));

const tibiadataCoreMocks = vi.hoisted(() => ({
  TibiaDataNotFoundError: class TibiaDataNotFoundError extends Error {},
}));

vi.mock('@/lib/auth', () => authMocks);
vi.mock('@/lib/tibiadata', () => tibiadataCoreMocks);
vi.mock('@/lib/tibiadata-extra', () => tibiadataMocks);

import { GET } from './route';

const params = (world: string, town: string) => ({
  params: Promise.resolve({ world, town }),
});

describe('GET /api/houses/:world/:town', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(
      createRequest('http://localhost/api/houses/Dia/Thais'),
      params('Dia', 'Thais'),
    );

    expect(response.status).toBe(401);
    expect(tibiadataMocks.fetchHouses).not.toHaveBeenCalled();
  });

  it('returns houses overview for a town', async () => {
    const data = {
      guildhallList: [],
      houseList: [{ auctioned: false, houseId: 1234, name: 'House of Test', rented: true }],
      town: 'Thais',
      world: 'Dia',
    };
    tibiadataMocks.fetchHouses.mockResolvedValue(data);

    const response = await GET(
      createRequest('http://localhost/api/houses/Dia/Thais'),
      params('Dia', 'Thais'),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data });
    expect(tibiadataMocks.fetchHouses).toHaveBeenCalledWith('Dia', 'Thais');
  });

  it('returns 400 for invalid town param', async () => {
    const response = await GET(
      createRequest('http://localhost/api/houses/Dia/town'),
      params('Dia', 'x'.repeat(101)),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'VALIDATION_FAILED' },
    });
  });

  it('returns 404 when TibiaData reports missing houses', async () => {
    tibiadataMocks.fetchHouses.mockRejectedValue(
      new tibiadataCoreMocks.TibiaDataNotFoundError('Houses not found'),
    );

    const response = await GET(
      createRequest('http://localhost/api/houses/Dia/Thais'),
      params('Dia', 'Thais'),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'NOT_FOUND', message: 'houses not found' },
    });
  });

  it('returns 502 when upstream request fails', async () => {
    tibiadataMocks.fetchHouses.mockRejectedValue(new Error('upstream down'));

    const response = await GET(
      createRequest('http://localhost/api/houses/Dia/Thais'),
      params('Dia', 'Thais'),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Could not load houses' },
    });
  });
});
