import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequest } from '@/test/http';

const snapshotMocks = vi.hoisted(() => ({
  listCharacterHighscoresHistory: vi.fn(),
}));

vi.mock('@/lib/highscores-snapshots', () => snapshotMocks);

import { GET } from './route';

const params = (name: string) => ({ params: Promise.resolve({ name }) });
const URL = 'http://localhost/api/character/Trollefar/highscores-history';

describe('GET /api/character/:name/highscores-history', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns snapshot history with total count', async () => {
    const snapshot = {
      id: 7,
      characterName: 'Trollefar',
      world: 'Antica',
      vocation: 'Elite Knight',
      level: 400,
      rank: 12,
      exactExperience: 1_050_000_000,
      checkedAt: '2026-10-15T08:00:00.000Z',
    };
    snapshotMocks.listCharacterHighscoresHistory.mockResolvedValue([snapshot]);

    const response = await GET(createRequest(URL), params('Trollefar'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: { data: [snapshot], total: 1 } });
    expect(snapshotMocks.listCharacterHighscoresHistory).toHaveBeenCalledWith('Trollefar');
  });

  it('rejects a character name that is too long', async () => {
    const response = await GET(createRequest(URL), params('x'.repeat(31)));

    expect(response.status).toBe(400);
    expect(snapshotMocks.listCharacterHighscoresHistory).not.toHaveBeenCalled();
  });

  it('returns contract error when the database query fails', async () => {
    snapshotMocks.listCharacterHighscoresHistory.mockRejectedValue(new Error('db down'));

    const response = await GET(createRequest(URL), params('Trollefar'));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'DB_QUERY_FAILED',
        message: 'Could not load character highscores history',
      },
    });
  });
});
