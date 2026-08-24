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

const snapshotsMocks = vi.hoisted(() => ({
  listHighscoresSnapshots: vi.fn(),
}));

vi.mock('@/lib/highscores-snapshots', () => ({
  listHighscoresSnapshots: snapshotsMocks.listHighscoresSnapshots,
}));

import { GET } from './route';

describe('GET /api/highscores-snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await GET(createRequest('http://localhost/api/highscores-snapshots'));

    expect(response.status).toBe(401);
  });

  it('returns paginated highscores snapshots', async () => {
    snapshotsMocks.listHighscoresSnapshots.mockResolvedValue({
      data: [
        {
          id: 1,
          characterName: 'Selibess',
          world: 'Dia',
          vocation: 'Elite Knight',
          level: 2121,
          rank: 1,
          exactExperience: 158703015209,
          checkedAt: '2026-08-24T19:11:28Z',
        },
      ],
      total: 1,
      worlds: ['Dia'],
    });

    const response = await GET(
      createRequest(
        'http://localhost/api/highscores-snapshots?page=2&pageSize=25&world=Dia&sortDir=asc',
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: [
        {
          id: 1,
          characterName: 'Selibess',
          world: 'Dia',
          vocation: 'Elite Knight',
          level: 2121,
          rank: 1,
          exactExperience: 158703015209,
          checkedAt: '2026-08-24T19:11:28Z',
        },
      ],
      total: 1,
      page: 2,
      pageSize: 25,
      totalPages: 1,
      sortBy: 'level',
      sortDir: 'asc',
      world: 'Dia',
      worlds: ['Dia'],
    });

    expect(snapshotsMocks.listHighscoresSnapshots).toHaveBeenCalledWith(2, 25, 'Dia', 'asc');
  });

  it('falls back to safe defaults for invalid query params', async () => {
    snapshotsMocks.listHighscoresSnapshots.mockResolvedValue({
      data: [],
      total: 0,
      worlds: [],
    });

    const response = await GET(
      createRequest('http://localhost/api/highscores-snapshots?page=0&pageSize=9999&sortDir=bad'),
    );

    expect(response.status).toBe(200);
    expect(snapshotsMocks.listHighscoresSnapshots).toHaveBeenCalledWith(1, 200, null, 'desc');
  });
});
