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

const progressMocks = vi.hoisted(() => ({
  listCharacterProgress: vi.fn(),
  upsertCharacterProgress: vi.fn(),
}));

vi.mock('@/lib/character-progress', () => ({
  listCharacterProgress: progressMocks.listCharacterProgress,
  upsertCharacterProgress: progressMocks.upsertCharacterProgress,
}));

const profileMocks = vi.hoisted(() => ({
  getCurrentUserProfile: vi.fn(),
}));

vi.mock('@/lib/profile', () => ({
  getCurrentUserProfile: profileMocks.getCurrentUserProfile,
}));

import { GET, PUT } from './route';

const URL = 'http://localhost/api/auth/me/character-progress';

describe('GET /api/auth/me/character-progress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(createRequest(URL));

    expect(response.status).toBe(401);
  });

  it('returns progress entries', async () => {
    progressMocks.listCharacterProgress.mockResolvedValue([
      {
        characterName: 'Trollefar',
        targetKind: 'boss',
        targetName: 'Lloyd',
        status: 'completed',
        updatedAt: '2026-09-08T07:00:00.000Z',
      },
    ]);

    const response = await GET(createRequest(URL));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        entries: [
          {
            characterName: 'Trollefar',
            targetKind: 'boss',
            targetName: 'Lloyd',
            status: 'completed',
            updatedAt: '2026-09-08T07:00:00.000Z',
          },
        ],
      },
    });
  });
});

describe('PUT /api/auth/me/character-progress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('rejects invalid payload', async () => {
    const response = await PUT(createJsonRequest(URL, 'PUT', { targetKind: 'boss' }));

    expect(response.status).toBe(400);
  });

  it('requires linked main character', async () => {
    profileMocks.getCurrentUserProfile.mockResolvedValue({ mainCharacter: null });

    const response = await PUT(
      createJsonRequest(URL, 'PUT', {
        targetKind: 'boss',
        targetName: 'Lloyd',
        status: 'completed',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'No main character linked',
      },
    });
  });

  it('saves status for current main character', async () => {
    profileMocks.getCurrentUserProfile.mockResolvedValue({
      mainCharacter: { name: 'Trollefar' },
    });
    progressMocks.upsertCharacterProgress.mockResolvedValue({
      characterName: 'Trollefar',
      targetKind: 'creature',
      targetName: 'Dragon Lord',
      status: 'first-time',
      updatedAt: '2026-09-08T07:00:00.000Z',
    });

    const response = await PUT(
      createJsonRequest(URL, 'PUT', {
        targetKind: 'creature',
        targetName: 'Dragon Lord',
        status: 'first-time',
      }),
    );

    expect(progressMocks.upsertCharacterProgress).toHaveBeenCalledWith({
      googleId: 'google-1',
      characterName: 'Trollefar',
      targetKind: 'creature',
      targetName: 'Dragon Lord',
      status: 'first-time',
    });
    expect(response.status).toBe(200);
  });
});
