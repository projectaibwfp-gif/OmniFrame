import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createJsonRequest } from '@/test/http';

const LOOKUPS_URL = 'http://localhost/api/character-lookups';
const JOB_ID = '6f1c2a4e-9b3d-4c8a-a1f2-3e4d5c6b7a80';

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
}));

const jobMocks = vi.hoisted(() => ({
  enqueueCharacterLookupJob: vi.fn(),
}));

const workerMocks = vi.hoisted(() => ({
  processCharacterLookupJob: vi.fn(),
}));

const nextMocks = vi.hoisted(() => ({
  after: vi.fn(),
}));

vi.mock('next/server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/server')>()),
  after: nextMocks.after,
}));
vi.mock('@/lib/auth', () => authMocks);
vi.mock('@/lib/character-lookup-jobs', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/character-lookup-jobs')>()),
  enqueueCharacterLookupJob: jobMocks.enqueueCharacterLookupJob,
}));
vi.mock('@/lib/character-lookup-worker', () => workerMocks);

import { POST } from './route';

function lookupRequest(body: unknown) {
  return createJsonRequest(LOOKUPS_URL, 'POST', body);
}

function queuedJob(status: string) {
  return {
    jobId: JOB_ID,
    status,
    createdAt: '2026-11-16T12:00:00.000Z',
    startedAt: null,
    finishedAt: null,
  };
}

describe('POST /api/character-lookups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('queues a new lookup and starts it after responding', async () => {
    jobMocks.enqueueCharacterLookupJob.mockResolvedValue({
      kind: 'created',
      job: queuedJob('pending'),
    });

    const response = await POST(lookupRequest({ name: ' Trollefar ' }));

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      data: { jobId: JOB_ID, status: 'pending' },
    });
    expect(jobMocks.enqueueCharacterLookupJob).toHaveBeenCalledWith('Trollefar', 'google-1');
    expect(nextMocks.after).toHaveBeenCalledTimes(1);

    await nextMocks.after.mock.calls[0][0]();
    expect(workerMocks.processCharacterLookupJob).toHaveBeenCalledWith(JOB_ID);
  });

  it('returns the active job without starting another worker while it is processing', async () => {
    jobMocks.enqueueCharacterLookupJob.mockResolvedValue({
      kind: 'existing',
      job: queuedJob('processing'),
    });

    const response = await POST(lookupRequest({ name: 'Trollefar' }));

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      data: { jobId: JOB_ID, status: 'processing' },
    });
    expect(nextMocks.after).not.toHaveBeenCalled();
  });

  it('rejects the lookup with 429 when the queue is full', async () => {
    jobMocks.enqueueCharacterLookupJob.mockResolvedValue({ kind: 'queue-full' });

    const response = await POST(lookupRequest({ name: 'Trollefar' }));

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'CHARACTER_LOOKUP_QUEUE_FULL' },
    });
    expect(nextMocks.after).not.toHaveBeenCalled();
  });

  it('rejects a body without a character name', async () => {
    const response = await POST(lookupRequest({ name: '' }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'VALIDATION_FAILED' },
    });
    expect(jobMocks.enqueueCharacterLookupJob).not.toHaveBeenCalled();
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await POST(lookupRequest({ name: 'Trollefar' }));

    expect(response.status).toBe(401);
    expect(jobMocks.enqueueCharacterLookupJob).not.toHaveBeenCalled();
  });

  it('returns 500 when the job cannot be stored', async () => {
    jobMocks.enqueueCharacterLookupJob.mockRejectedValue(new Error('db down'));

    const response = await POST(lookupRequest({ name: 'Trollefar' }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'DB_QUERY_FAILED' },
    });
  });
});
