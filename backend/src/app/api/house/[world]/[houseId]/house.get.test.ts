import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
}));

const tibiadataMocks = vi.hoisted(() => ({
  fetchHouse: vi.fn(),
}));

const tibiadataCoreMocks = vi.hoisted(() => ({
  TibiaDataNotFoundError: class TibiaDataNotFoundError extends Error {},
}));

vi.mock('@/lib/auth', () => authMocks);
vi.mock('@/lib/tibiadata', () => tibiadataCoreMocks);
vi.mock('@/lib/tibiadata-extra', () => tibiadataMocks);

import { GET } from './route';

const params = (world: string, houseId: string) => ({
  params: Promise.resolve({ world, houseId }),
});

describe('GET /api/house/:world/:houseId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(
      createRequest('http://localhost/api/house/Dia/1234'),
      params('Dia', '1234'),
    );

    expect(response.status).toBe(401);
    expect(tibiadataMocks.fetchHouse).not.toHaveBeenCalled();
  });

  it('returns house details', async () => {
    const data = {
      beds: 2,
      houseId: 1234,
      img: null,
      name: 'House of Test',
      rent: 5000,
      size: 100,
      status: null,
      town: 'Thais',
      type: 'house',
      world: 'Dia',
    };
    tibiadataMocks.fetchHouse.mockResolvedValue(data);

    const response = await GET(
      createRequest('http://localhost/api/house/Dia/1234'),
      params('Dia', '1234'),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data });
    expect(tibiadataMocks.fetchHouse).toHaveBeenCalledWith('Dia', 1234);
  });

  it('returns 400 for invalid house id param', async () => {
    const response = await GET(
      createRequest('http://localhost/api/house/Dia/zero'),
      params('Dia', 'zero'),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'VALIDATION_FAILED' },
    });
  });

  it('returns 404 when TibiaData reports missing house', async () => {
    tibiadataMocks.fetchHouse.mockRejectedValue(
      new tibiadataCoreMocks.TibiaDataNotFoundError('House not found'),
    );

    const response = await GET(
      createRequest('http://localhost/api/house/Dia/99999'),
      params('Dia', '99999'),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'NOT_FOUND', message: 'house not found' },
    });
  });

  it('returns 502 when upstream request fails', async () => {
    tibiadataMocks.fetchHouse.mockRejectedValue(new Error('upstream down'));

    const response = await GET(
      createRequest('http://localhost/api/house/Dia/1234'),
      params('Dia', '1234'),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Could not load house' },
    });
  });
});
