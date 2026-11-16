import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequest } from '@/test/http';

const CRON_TOKEN = 'cron-secret';
const CRON_URL = 'http://localhost/api/cron/character-lookups';

const workerMocks = vi.hoisted(() => ({
  processCharacterLookupBatch: vi.fn(),
}));

vi.mock('@/lib/character-lookup-worker', () => workerMocks);

import { POST } from './route';

function cronRequest(token: string | null = CRON_TOKEN) {
  return createRequest(CRON_URL, {
    method: 'POST',
    headers: token === null ? {} : { authorization: `Bearer ${token}` },
  });
}

describe('POST /api/cron/character-lookups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CRON_AUTH_TOKEN', CRON_TOKEN);
  });

  it('processes a batch and returns its stats', async () => {
    const stats = { expired: 1, claimed: 3, completed: 2, retried: 1, failed: 0, duration: 42 };
    workerMocks.processCharacterLookupBatch.mockResolvedValue(stats);

    const response = await POST(cronRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: stats });
  });

  it('rejects a request without the cron token', async () => {
    const response = await POST(cronRequest(null));

    expect(response.status).toBe(401);
    expect(workerMocks.processCharacterLookupBatch).not.toHaveBeenCalled();
  });

  it('returns 500 when the batch cannot be processed', async () => {
    workerMocks.processCharacterLookupBatch.mockRejectedValue(new Error('db down'));

    const response = await POST(cronRequest());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'DB_QUERY_FAILED' },
    });
  });
});
