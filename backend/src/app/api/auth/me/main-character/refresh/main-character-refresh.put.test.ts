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

vi.mock('@/lib/tibiadata', () => tibiadataMocks);

const profileMocks = vi.hoisted(() => ({
  setMainCharacterForUser: vi.fn(),
  getCurrentUserProfile: vi.fn(),
}));

vi.mock('@/lib/profile', () => profileMocks);

import { PUT } from './route';

const URL = 'http://localhost/api/auth/me/main-character/refresh';
const linkedUser = {
  email: 'anna@example.com',
  mainCharacter: {
    name: 'Trollefar',
    world: 'Antica',
    vocation: 'Elite Knight',
    level: 400,
    linkedAt: '2026-08-27T09:00:00.000Z',
  },
};

function refresh(): Promise<Response> {
  return PUT(createRequest(URL, { method: 'PUT' }));
}

describe('PUT /api/auth/me/main-character/refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await refresh();

    expect(response.status).toBe(401);
    expect(profileMocks.getCurrentUserProfile).not.toHaveBeenCalled();
  });

  it('returns contract error when loading the current user fails', async () => {
    profileMocks.getCurrentUserProfile.mockRejectedValue(new Error('db down'));

    const response = await refresh();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'DB_QUERY_FAILED', message: 'Could not load current user' },
    });
    expect(tibiadataMocks.fetchCharacter).not.toHaveBeenCalled();
  });

  it('requires a linked main character', async () => {
    profileMocks.getCurrentUserProfile.mockResolvedValue({ mainCharacter: null });

    const response = await refresh();

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'VALIDATION_FAILED', message: 'No main character linked' },
    });
  });

  it('returns 404 when TibiaData no longer knows the character', async () => {
    profileMocks.getCurrentUserProfile.mockResolvedValue(linkedUser);
    tibiadataMocks.fetchCharacter.mockRejectedValue(new tibiadataMocks.TibiaDataNotFoundError());

    const response = await refresh();

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'NOT_FOUND', message: 'Character not found on TibiaData' },
    });
  });

  it('returns 502 when TibiaData request fails', async () => {
    profileMocks.getCurrentUserProfile.mockResolvedValue(linkedUser);
    tibiadataMocks.fetchCharacter.mockRejectedValue(new Error('upstream down'));

    const response = await refresh();

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Could not refresh character from TibiaData' },
    });
  });

  it('stores refreshed character data and returns updated profile', async () => {
    profileMocks.getCurrentUserProfile.mockResolvedValue(linkedUser);
    tibiadataMocks.fetchCharacter.mockResolvedValue({
      name: 'Trollefar',
      world: 'Antica',
      vocation: 'Elite Knight',
      level: 401,
    });

    const response = await refresh();

    expect(response.status).toBe(200);
    expect(profileMocks.setMainCharacterForUser).toHaveBeenCalledWith({
      googleId: 'google-1',
      name: 'Trollefar',
      world: 'Antica',
      vocation: 'Elite Knight',
      level: 401,
    });
    await expect(response.json()).resolves.toEqual({ data: { user: linkedUser } });
  });
});
