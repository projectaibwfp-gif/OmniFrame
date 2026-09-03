import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequest } from '@/test/http';

const tibiadataMocks = vi.hoisted(() => ({
  fetchHighscoresForWorldAndVocation: vi.fn(),
}));

vi.mock('@/lib/tibiadata', () => tibiadataMocks);

import { POST } from './route';

describe('POST /api/cron/highscores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CRON_WORLDS', 'Dia');
  });

  it('processes all configured vocation entries', async () => {
    tibiadataMocks.fetchHighscoresForWorldAndVocation.mockResolvedValue(10);

    const response = await POST(createRequest('http://localhost/api/cron/highscores'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      stats: {
        worldsProcessed: 1,
        vocationsProcessed: 5,
        charactersCollected: 50,
      },
    });
    expect(tibiadataMocks.fetchHighscoresForWorldAndVocation).toHaveBeenCalledTimes(5);
  });

  it('continues processing after one vocation fails', async () => {
    tibiadataMocks.fetchHighscoresForWorldAndVocation
      .mockRejectedValueOnce(new Error('upstream down'))
      .mockResolvedValue(10);

    const response = await POST(createRequest('http://localhost/api/cron/highscores'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      stats: {
        worldsProcessed: 1,
        vocationsProcessed: 4,
        charactersCollected: 40,
      },
    });
  });
});
