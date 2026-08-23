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
  fetchCreatures: vi.fn(),
}));

vi.mock('@/lib/tibiadata', () => ({
  fetchCreatures: tibiadataMocks.fetchCreatures,
}));

import { GET } from './route';

describe('GET /api/creatures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(createRequest('http://localhost/api/creatures'));

    expect(response.status).toBe(401);
  });

  it('returns boosted creature and list', async () => {
    tibiadataMocks.fetchCreatures.mockResolvedValue({
      boosted: {
        name: 'Manticore',
        race: 'manticore',
        imageUrl: 'https://static.tibia.com/images/global/header/monsters/manticore.gif',
        featured: true,
      },
      creatureList: [
        {
          name: 'Manticore',
          race: 'manticore',
          imageUrl: 'https://static.tibia.com/images/global/header/monsters/manticore.gif',
          featured: true,
        },
        {
          name: 'Acid Blobs',
          race: 'acidblob',
          imageUrl: 'https://static.tibia.com/images/library/acidblob.gif',
          featured: false,
        },
      ],
    });

    const response = await GET(createRequest('http://localhost/api/creatures'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        boosted: {
          name: 'Manticore',
          race: 'manticore',
          imageUrl: 'https://static.tibia.com/images/global/header/monsters/manticore.gif',
          featured: true,
        },
        creatureList: [
          {
            name: 'Manticore',
            race: 'manticore',
            imageUrl: 'https://static.tibia.com/images/global/header/monsters/manticore.gif',
            featured: true,
          },
          {
            name: 'Acid Blobs',
            race: 'acidblob',
            imageUrl: 'https://static.tibia.com/images/library/acidblob.gif',
            featured: false,
          },
        ],
      },
    });
  });

  it('returns 502 when upstream request fails', async () => {
    tibiadataMocks.fetchCreatures.mockRejectedValue(new Error('upstream down'));

    const response = await GET(createRequest('http://localhost/api/creatures'));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Could not load creatures',
      },
    });
  });
});
