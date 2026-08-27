import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createJsonRequest, createRequest } from '@/test/http';

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

const profileMocks = vi.hoisted(() => ({
  setMainCharacterForUser: vi.fn(),
  clearMainCharacterForUser: vi.fn(),
  getCurrentUserProfile: vi.fn(),
}));

vi.mock('@/lib/profile', () => ({
  setMainCharacterForUser: profileMocks.setMainCharacterForUser,
  clearMainCharacterForUser: profileMocks.clearMainCharacterForUser,
  getCurrentUserProfile: profileMocks.getCurrentUserProfile,
}));

import { DELETE, PUT } from './route';

const URL = 'http://localhost/api/auth/me/main-character';

describe('PUT /api/auth/me/main-character', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await PUT(createJsonRequest(URL, 'PUT', { name: 'Trollefar' }));

    expect(response.status).toBe(401);
  });

  it('rejects empty character name', async () => {
    const response = await PUT(createJsonRequest(URL, 'PUT', { name: '   ' }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'VALIDATION_FAILED' },
    });
  });

  it('returns 404 when TibiaData does not know the character', async () => {
    tibiadataMocks.fetchCharacter.mockRejectedValue(new tibiadataMocks.TibiaDataNotFoundError());

    const response = await PUT(createJsonRequest(URL, 'PUT', { name: 'Nobody' }));

    expect(response.status).toBe(404);
    expect(profileMocks.setMainCharacterForUser).not.toHaveBeenCalled();
  });

  it('links character to the current user and returns updated profile', async () => {
    tibiadataMocks.fetchCharacter.mockResolvedValue({
      name: 'Trollefar',
      world: 'Antica',
      vocation: 'Elite Knight',
      level: 400,
    });
    profileMocks.getCurrentUserProfile.mockResolvedValue({
      email: 'anna@example.com',
      mainCharacter: {
        name: 'Trollefar',
        world: 'Antica',
        vocation: 'Elite Knight',
        level: 400,
        linkedAt: '2026-08-27T09:00:00.000Z',
      },
    });

    const response = await PUT(createJsonRequest(URL, 'PUT', { name: 'trollefar' }));

    expect(response.status).toBe(200);
    expect(profileMocks.setMainCharacterForUser).toHaveBeenCalledWith({
      googleId: 'google-1',
      name: 'Trollefar',
      world: 'Antica',
      vocation: 'Elite Knight',
      level: 400,
    });
    await expect(response.json()).resolves.toEqual({
      data: {
        user: {
          email: 'anna@example.com',
          mainCharacter: {
            name: 'Trollefar',
            world: 'Antica',
            vocation: 'Elite Knight',
            level: 400,
            linkedAt: '2026-08-27T09:00:00.000Z',
          },
        },
      },
    });
  });
});

describe('DELETE /api/auth/me/main-character', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await DELETE(createRequest(URL, { method: 'DELETE' }));

    expect(response.status).toBe(401);
  });

  it('clears main character and returns updated profile', async () => {
    profileMocks.getCurrentUserProfile.mockResolvedValue({
      email: 'anna@example.com',
      mainCharacter: null,
    });

    const response = await DELETE(createRequest(URL, { method: 'DELETE' }));

    expect(response.status).toBe(200);
    expect(profileMocks.clearMainCharacterForUser).toHaveBeenCalledWith('google-1');
    await expect(response.json()).resolves.toEqual({
      data: {
        user: {
          email: 'anna@example.com',
          mainCharacter: null,
        },
      },
    });
  });
});
