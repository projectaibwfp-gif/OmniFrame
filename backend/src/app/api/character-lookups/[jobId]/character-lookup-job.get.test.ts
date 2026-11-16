import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeniedResponse, createRequest } from '@/test/http';

const JOB_ID = '6f1c2a4e-9b3d-4c8a-a1f2-3e4d5c6b7a80';
const JOB_URL = `http://localhost/api/character-lookups/${JOB_ID}`;

const authMocks = vi.hoisted(() => ({
  isAuthDenied: vi.fn(),
  requireAuth: vi.fn(),
}));

const jobMocks = vi.hoisted(() => ({
  getCharacterLookupJob: vi.fn(),
}));

vi.mock('@/lib/auth', () => authMocks);
vi.mock('@/lib/character-lookup-jobs', () => jobMocks);

import { GET } from './route';

function getJob(jobId: string) {
  return GET(createRequest(JOB_URL), { params: Promise.resolve({ jobId }) });
}

describe('GET /api/character-lookups/:jobId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAuth.mockResolvedValue({ session: { sub: 'google-1' } });
    authMocks.isAuthDenied.mockImplementation((auth) => 'response' in auth);
  });

  it('returns the job status with its result', async () => {
    const job = {
      jobId: JOB_ID,
      status: 'completed',
      result: { character: { name: 'Trollefar' }, history: [] },
      createdAt: '2026-11-16T12:00:00.000Z',
      startedAt: '2026-11-16T12:00:01.000Z',
      finishedAt: '2026-11-16T12:00:05.000Z',
    };
    jobMocks.getCharacterLookupJob.mockResolvedValue(job);

    const response = await getJob(JOB_ID);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: job });
    expect(jobMocks.getCharacterLookupJob).toHaveBeenCalledWith(JOB_ID);
  });

  it('returns 404 for an unknown job', async () => {
    jobMocks.getCharacterLookupJob.mockResolvedValue(null);

    const response = await getJob(JOB_ID);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ error: { code: 'NOT_FOUND' } });
  });

  it('rejects a job id that is not a UUID', async () => {
    const response = await getJob('not-a-uuid');

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'VALIDATION_FAILED' },
    });
    expect(jobMocks.getCharacterLookupJob).not.toHaveBeenCalled();
  });

  it('denies unauthenticated access', async () => {
    authMocks.requireAuth.mockResolvedValue({ response: createDeniedResponse() });

    const response = await getJob(JOB_ID);

    expect(response.status).toBe(401);
  });

  it('returns 500 when the job cannot be loaded', async () => {
    jobMocks.getCharacterLookupJob.mockRejectedValue(new Error('db down'));

    const response = await getJob(JOB_ID);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'DB_QUERY_FAILED' },
    });
  });
});
