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
  fetchCharacter: vi.fn(),
  TibiaDataNotFoundError: class TibiaDataNotFoundError extends Error {},
}));

vi.mock('@/lib/tibiadata', () => ({
  fetchCharacter: tibiadataMocks.fetchCharacter,
  TibiaDataNotFoundError: tibiadataMocks.TibiaDataNotFoundError,
}));

const lookupMocks = vi.hoisted(() => ({
  saveCharacterLookup: vi.fn(),
  listCharacterLookupHistory: vi.fn(),
  getLatestCharacterSnapshot: vi.fn(),
}));

vi.mock('@/lib/character-lookups', () => ({
  saveCharacterLookup: lookupMocks.saveCharacterLookup,
  listCharacterLookupHistory: lookupMocks.listCharacterLookupHistory,
  getLatestCharacterSnapshot: lookupMocks.getLatestCharacterSnapshot,
}));

import { GET } from './route';

describe('GET /api/character/:name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
    lookupMocks.listCharacterLookupHistory.mockResolvedValue([]);
    lookupMocks.getLatestCharacterSnapshot.mockResolvedValue(null);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(createRequest('http://localhost/api/character/Trollefar'), {
      params: Promise.resolve({ name: 'Trollefar' }),
    });

    expect(response.status).toBe(401);
  });

  it('returns character details for valid name', async () => {
    tibiadataMocks.fetchCharacter.mockResolvedValue({
      name: 'Trollefar',
      sex: 'male',
      title: 'Trolltrasher',
      vocation: 'Knight',
      level: 202,
      achievementPoints: 379,
      world: 'Vunira',
      residence: 'Thais',
      marriedTo: 'Mighty troll',
      lastLogin: '2026-07-05T00:33:18Z',
      accountStatus: 'Free Account',
      unlockedTitles: 9,
      comment: 'Sample comment',
      guild: { name: 'Elysium', rank: 'Follower' },
      formerNames: [],
      formerWorlds: [],
      accountCreated: '2004-08-12T09:28:46Z',
      loyaltyTitle: 'Keeper of Tibia',
      achievements: [{ name: 'Explorer', grade: 2, secret: false }],
      experience: null,
      otherCharacters: [
        {
          name: 'Trollemor',
          world: 'Vunira',
          status: 'offline',
          deleted: false,
          main: false,
          traded: false,
        },
      ],
    });

    const response = await GET(createRequest('http://localhost/api/character/Trollefar'), {
      params: Promise.resolve({ name: 'Trollefar' }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        character: {
          name: 'Trollefar',
          sex: 'male',
          title: 'Trolltrasher',
          vocation: 'Knight',
          level: 202,
          achievementPoints: 379,
          world: 'Vunira',
          residence: 'Thais',
          marriedTo: 'Mighty troll',
          lastLogin: '2026-07-05T00:33:18Z',
          accountStatus: 'Free Account',
          unlockedTitles: 9,
          comment: 'Sample comment',
          guild: { name: 'Elysium', rank: 'Follower' },
          formerNames: [],
          formerWorlds: [],
          accountCreated: '2004-08-12T09:28:46Z',
          loyaltyTitle: 'Keeper of Tibia',
          achievements: [{ name: 'Explorer', grade: 2, secret: false }],
          experience: null,
          otherCharacters: [
            {
              name: 'Trollemor',
              world: 'Vunira',
              status: 'offline',
              deleted: false,
              main: false,
              traded: false,
            },
          ],
        },
        history: [],
      },
    });

    expect(lookupMocks.saveCharacterLookup).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Trollefar' }),
      'Trollefar',
      'google-1',
    );
    expect(lookupMocks.listCharacterLookupHistory).toHaveBeenCalledWith('Trollefar');
  });

  it('returns 404 when character does not exist', async () => {
    tibiadataMocks.fetchCharacter.mockRejectedValue(
      new tibiadataMocks.TibiaDataNotFoundError('Character not found'),
    );

    const response = await GET(createRequest('http://localhost/api/character/Unknown'), {
      params: Promise.resolve({ name: 'Unknown' }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Character not found',
      },
    });
  });

  it('returns cached snapshot when TibiaData is temporarily unavailable', async () => {
    tibiadataMocks.fetchCharacter.mockRejectedValue(new Error('upstream down'));
    lookupMocks.getLatestCharacterSnapshot.mockResolvedValue({
      name: 'Trollefar',
      sex: 'male',
      title: 'Trolltrasher',
      vocation: 'Knight',
      level: 202,
      achievementPoints: 379,
      world: 'Vunira',
      residence: 'Thais',
      marriedTo: 'Mighty troll',
      lastLogin: '2026-07-05T00:33:18Z',
      accountStatus: 'Free Account',
      unlockedTitles: 9,
      comment: 'Snapshot comment',
      guild: { name: 'Elysium', rank: 'Follower' },
      formerNames: [],
      formerWorlds: [],
      accountCreated: '2004-08-12T09:28:46Z',
      loyaltyTitle: 'Keeper of Tibia',
      achievements: [],
      experience: null,
      otherCharacters: [],
    });

    const response = await GET(createRequest('http://localhost/api/character/Trollefar'), {
      params: Promise.resolve({ name: 'Trollefar' }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        character: expect.objectContaining({
          name: 'Trollefar',
          world: 'Vunira',
          comment: 'Snapshot comment',
        }),
        history: [],
      },
    });
    expect(lookupMocks.getLatestCharacterSnapshot).toHaveBeenCalledWith('Trollefar');
  });
});
