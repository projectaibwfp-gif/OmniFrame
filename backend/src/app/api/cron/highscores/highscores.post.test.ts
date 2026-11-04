import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequest } from '@/test/http';

const CRON_TOKEN = 'cron-secret';
const CRON_URL = 'http://localhost/api/cron/highscores';

const tibiadataMocks = vi.hoisted(() => ({
  fetchHighscoresForWorldAndVocation: vi.fn(),
}));

const retentionMocks = vi.hoisted(() => ({
  pruneExpiredHistory: vi.fn(),
}));

vi.mock('@/lib/tibiadata', () => tibiadataMocks);
vi.mock('@/lib/data-retention', () => retentionMocks);

import { GET, POST } from './route';

function cronRequest(url = CRON_URL, token: string | null = CRON_TOKEN, method = 'POST') {
  return createRequest(url, {
    method,
    headers: token === null ? {} : { authorization: `Bearer ${token}` },
  });
}

describe('POST /api/cron/highscores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CRON_WORLDS', 'Dia');
    vi.stubEnv('CRON_AUTH_TOKEN', CRON_TOKEN);
    retentionMocks.pruneExpiredHistory.mockResolvedValue({
      snapshotsDeleted: 0,
      lookupsDeleted: 0,
    });
  });

  it('rejects a request without the cron token', async () => {
    const response = await POST(cronRequest(CRON_URL, null));

    expect(response.status).toBe(401);
    expect(tibiadataMocks.fetchHighscoresForWorldAndVocation).not.toHaveBeenCalled();
  });

  it('rejects a request with a wrong cron token', async () => {
    const response = await POST(cronRequest(CRON_URL, 'wrong-secret'));

    expect(response.status).toBe(401);
  });

  it('rejects every request when CRON_AUTH_TOKEN is not configured', async () => {
    vi.stubEnv('CRON_AUTH_TOKEN', '');

    const response = await POST(cronRequest(CRON_URL, ''));

    expect(response.status).toBe(401);
  });

  it('processes all configured vocation entries', async () => {
    tibiadataMocks.fetchHighscoresForWorldAndVocation.mockResolvedValue(10);

    const response = await POST(cronRequest());

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
    expect(retentionMocks.pruneExpiredHistory).toHaveBeenCalledTimes(1);
  });

  it('processes only the requested world', async () => {
    vi.stubEnv('CRON_WORLDS', 'Dia,Amera');
    tibiadataMocks.fetchHighscoresForWorldAndVocation.mockResolvedValue(10);

    const response = await POST(cronRequest(`${CRON_URL}?world=Amera`));

    expect(response.status).toBe(200);
    expect(tibiadataMocks.fetchHighscoresForWorldAndVocation).toHaveBeenCalledTimes(5);
    expect(tibiadataMocks.fetchHighscoresForWorldAndVocation).toHaveBeenCalledWith(
      'Amera',
      'knights',
    );
  });

  it('rejects a world outside CRON_WORLDS', async () => {
    const response = await POST(cronRequest(`${CRON_URL}?world=Secura`));

    expect(response.status).toBe(400);
    expect(tibiadataMocks.fetchHighscoresForWorldAndVocation).not.toHaveBeenCalled();
  });

  it('continues processing after one vocation fails', async () => {
    tibiadataMocks.fetchHighscoresForWorldAndVocation
      .mockRejectedValueOnce(new Error('upstream down'))
      .mockResolvedValue(10);

    const response = await POST(cronRequest());

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

describe('GET /api/cron/highscores', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_WORLDS', 'Dia, Amera');
    vi.stubEnv('CRON_AUTH_TOKEN', CRON_TOKEN);
  });

  it('lists the configured worlds', async () => {
    const response = await GET(cronRequest(CRON_URL, CRON_TOKEN, 'GET'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: { worlds: ['Dia', 'Amera'] } });
  });

  it('rejects a request without the cron token', async () => {
    const response = await GET(cronRequest(CRON_URL, null, 'GET'));

    expect(response.status).toBe(401);
  });
});
