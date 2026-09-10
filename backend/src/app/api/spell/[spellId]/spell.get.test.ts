import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createRequest } from '@/test/http';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
}));

const tibiadataMocks = vi.hoisted(() => ({
  fetchSpell: vi.fn(),
}));

const tibiadataCoreMocks = vi.hoisted(() => ({
  TibiaDataNotFoundError: class TibiaDataNotFoundError extends Error {},
}));

vi.mock('@/lib/auth', () => authMocks);
vi.mock('@/lib/tibiadata', () => tibiadataCoreMocks);
vi.mock('@/lib/tibiadata-extra', () => tibiadataMocks);

import { GET } from './route';

const params = (spellId: string) => ({ params: Promise.resolve({ spellId }) });

describe('GET /api/spell/:spellId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(
      createRequest('http://localhost/api/spell/utevo lux'),
      params('utevo lux'),
    );

    expect(response.status).toBe(401);
    expect(tibiadataMocks.fetchSpell).not.toHaveBeenCalled();
  });

  it('returns spell details', async () => {
    const data = {
      description: 'Creates a bright light',
      hasRuneInformation: false,
      hasSpellInformation: true,
      imageUrl: null,
      name: 'Light',
      runeInformation: null,
      spellId: 'utevo lux',
      spellInformation: {
        amount: null,
        city: ["Ab'Dendriel", 'Carlin'],
        cooldownAlone: null,
        cooldownGroup: null,
        damageType: null,
        formula: null,
        groupAttack: false,
        groupHealing: false,
        groupSupport: true,
        level: null,
        mana: 5,
        premiumOnly: false,
        price: 5,
        soulPoints: null,
        typeInstant: true,
        typeRune: false,
        vocation: ['Druids', 'Sorcerers', 'Paladins', 'Knights'],
      },
    };
    tibiadataMocks.fetchSpell.mockResolvedValue(data);

    const response = await GET(
      createRequest('http://localhost/api/spell/utevo lux'),
      params('utevo lux'),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data });
    expect(tibiadataMocks.fetchSpell).toHaveBeenCalledWith('utevo lux');
  });

  it('returns 400 for invalid spell id param', async () => {
    const response = await GET(
      createRequest('http://localhost/api/spell/id'),
      params('x'.repeat(101)),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'VALIDATION_FAILED' },
    });
  });

  it('returns 404 when TibiaData reports missing spell', async () => {
    tibiadataMocks.fetchSpell.mockRejectedValue(
      new tibiadataCoreMocks.TibiaDataNotFoundError('Spell not found'),
    );

    const response = await GET(
      createRequest('http://localhost/api/spell/unknown'),
      params('unknown'),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'NOT_FOUND', message: 'spell not found' },
    });
  });

  it('returns 502 when upstream request fails', async () => {
    tibiadataMocks.fetchSpell.mockRejectedValue(new Error('upstream down'));

    const response = await GET(
      createRequest('http://localhost/api/spell/utevo lux'),
      params('utevo lux'),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Could not load spell' },
    });
  });
});
