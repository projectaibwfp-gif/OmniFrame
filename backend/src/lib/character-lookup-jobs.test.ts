import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMocks = vi.hoisted(() => ({
  getSql: vi.fn(),
  sql: vi.fn(),
}));

vi.mock('./db', () => ({
  getSql: dbMocks.getSql,
}));

import {
  CHARACTER_LOOKUP_MAX_ACTIVE_JOBS,
  CHARACTER_LOOKUP_MAX_ATTEMPTS,
  CHARACTER_LOOKUP_STUCK_AFTER_SECONDS,
  claimCharacterLookupJobs,
  completeCharacterLookupJob,
  enqueueCharacterLookupJob,
  failExhaustedStuckJobs,
  getCharacterLookupJob,
} from './character-lookup-jobs';

const JOB_ID = '6f1c2a4e-9b3d-4c8a-a1f2-3e4d5c6b7a80';

function jobRow(overrides: Record<string, unknown> = {}) {
  return {
    jobId: JOB_ID,
    name: 'Trollefar',
    requestedBySub: 'google-1',
    status: 'pending',
    attempts: 0,
    result: null,
    error: null,
    createdAt: '2026-11-16 12:00:00+00',
    startedAt: null,
    finishedAt: null,
    ...overrides,
  };
}

function queryText(callIndex: number): string {
  return (dbMocks.sql.mock.calls[callIndex]?.[0] as TemplateStringsArray).join('?');
}

function queryValues(callIndex: number): unknown[] {
  return dbMocks.sql.mock.calls[callIndex]?.slice(1) ?? [];
}

describe('character lookup jobs repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getSql.mockReturnValue(dbMocks.sql);
  });

  describe('enqueueCharacterLookupJob', () => {
    it('reuses the active job for the same normalized name', async () => {
      dbMocks.sql.mockResolvedValueOnce([jobRow({ status: 'processing' })]);

      const result = await enqueueCharacterLookupJob('  TROLLEFAR ', 'google-2');

      expect(result).toMatchObject({ kind: 'existing', job: { status: 'processing' } });
      expect(dbMocks.sql).toHaveBeenCalledTimes(1);
      expect(queryValues(0)).toContain('trollefar');
    });

    it('rejects a new job when the active job cap is reached', async () => {
      dbMocks.sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: String(CHARACTER_LOOKUP_MAX_ACTIVE_JOBS) }]);

      const result = await enqueueCharacterLookupJob('Trollefar', 'google-1');

      expect(result).toEqual({ kind: 'queue-full' });
      expect(dbMocks.sql).toHaveBeenCalledTimes(2);
    });

    it('inserts a pending job and maps timestamps to ISO UTC', async () => {
      dbMocks.sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: '0' }])
        .mockResolvedValueOnce([jobRow()]);

      const result = await enqueueCharacterLookupJob('Trollefar', 'google-1');

      expect(result).toEqual({
        kind: 'created',
        job: {
          jobId: JOB_ID,
          status: 'pending',
          createdAt: '2026-11-16T12:00:00.000Z',
          startedAt: null,
          finishedAt: null,
        },
      });
      expect(queryText(2)).toContain('ON CONFLICT DO NOTHING');
    });

    it('returns the job inserted by a concurrent request when the insert conflicts', async () => {
      dbMocks.sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: '0' }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([jobRow()]);

      const result = await enqueueCharacterLookupJob('Trollefar', 'google-1');

      expect(result).toMatchObject({ kind: 'existing', job: { jobId: JOB_ID } });
    });
  });

  describe('getCharacterLookupJob', () => {
    it('includes the result and error only when present', async () => {
      const lookup = { character: { name: 'Trollefar' }, history: [] };
      dbMocks.sql.mockResolvedValueOnce([
        jobRow({
          status: 'completed',
          result: lookup,
          startedAt: '2026-11-16 12:00:01+00',
          finishedAt: '2026-11-16 12:00:05+00',
        }),
      ]);

      await expect(getCharacterLookupJob(JOB_ID)).resolves.toEqual({
        jobId: JOB_ID,
        status: 'completed',
        result: lookup,
        createdAt: '2026-11-16T12:00:00.000Z',
        startedAt: '2026-11-16T12:00:01.000Z',
        finishedAt: '2026-11-16T12:00:05.000Z',
      });
    });

    it('exposes the stored failure as an error code with a readable message', async () => {
      dbMocks.sql.mockResolvedValueOnce([
        jobRow({ status: 'failed', error: 'CHARACTER_NOT_FOUND' }),
      ]);

      await expect(getCharacterLookupJob(JOB_ID)).resolves.toMatchObject({
        status: 'failed',
        errorCode: 'CHARACTER_NOT_FOUND',
        error: 'Character not found',
      });
    });

    it('returns null for an unknown job', async () => {
      dbMocks.sql.mockResolvedValueOnce([]);

      await expect(getCharacterLookupJob(JOB_ID)).resolves.toBeNull();
    });
  });

  describe('claimCharacterLookupJobs', () => {
    it('claims pending and stuck jobs atomically in one statement', async () => {
      dbMocks.sql.mockResolvedValueOnce([jobRow({ status: 'processing', attempts: 1 })]);

      const jobs = await claimCharacterLookupJobs(5);

      expect(jobs).toEqual([
        { jobId: JOB_ID, name: 'Trollefar', requestedBySub: 'google-1', attempts: 1 },
      ]);
      expect(dbMocks.sql).toHaveBeenCalledTimes(1);
      const query = queryText(0);
      expect(query).toContain('attempts = attempts + 1');
      expect(query).toContain('FOR UPDATE SKIP LOCKED');
      expect(query).toContain('started_at < now()');
      expect(queryValues(0)).toEqual(
        expect.arrayContaining([
          'pending',
          'processing',
          CHARACTER_LOOKUP_MAX_ATTEMPTS,
          CHARACTER_LOOKUP_STUCK_AFTER_SECONDS,
          5,
        ]),
      );
    });
  });

  describe('failExhaustedStuckJobs', () => {
    it('fails stuck jobs that used their last attempt', async () => {
      dbMocks.sql.mockResolvedValueOnce([{ id: JOB_ID }]);

      await expect(failExhaustedStuckJobs()).resolves.toBe(1);
      expect(queryText(0)).toContain('attempts >=');
      expect(queryValues(0)).toEqual(
        expect.arrayContaining(['failed', CHARACTER_LOOKUP_MAX_ATTEMPTS]),
      );
    });
  });

  describe('completeCharacterLookupJob', () => {
    it('writes the result only for the attempt that claimed the job', async () => {
      dbMocks.sql.mockResolvedValueOnce([]);
      const job = { jobId: JOB_ID, name: 'Trollefar', requestedBySub: null, attempts: 2 };

      await completeCharacterLookupJob(job, {
        character: { name: 'Trollefar' } as never,
        history: [],
      });

      expect(queryText(0)).toContain('attempts =');
      expect(queryValues(0)).toEqual(expect.arrayContaining(['completed', JOB_ID, 2]));
    });
  });
});
