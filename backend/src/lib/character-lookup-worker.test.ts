import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const jobMocks = vi.hoisted(() => ({
  claimCharacterLookupJob: vi.fn(),
  claimCharacterLookupJobs: vi.fn(),
  completeCharacterLookupJob: vi.fn(),
  failCharacterLookupJob: vi.fn(),
  failExhaustedStuckJobs: vi.fn(),
  releaseCharacterLookupJobForRetry: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
  lookupCharacter: vi.fn(),
  findLatestCharacterLookup: vi.fn(),
  CharacterLookupStorageError: class CharacterLookupStorageError extends Error {},
}));

const tibiadataMocks = vi.hoisted(() => ({
  TibiaDataNotFoundError: class TibiaDataNotFoundError extends Error {},
}));

vi.mock('./character-lookup-jobs', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./character-lookup-jobs')>()),
  ...jobMocks,
}));
vi.mock('./character-lookup-service', () => serviceMocks);
vi.mock('./tibiadata', () => tibiadataMocks);

import {
  CHARACTER_LOOKUP_MAX_ATTEMPTS,
  CharacterLookupJobErrorCode,
} from './character-lookup-jobs';
import {
  CHARACTER_LOOKUP_TIMEOUT_MS,
  processCharacterLookupBatch,
  processCharacterLookupJob,
  runCharacterLookupJob,
} from './character-lookup-worker';

const JOB_ID = '6f1c2a4e-9b3d-4c8a-a1f2-3e4d5c6b7a80';
const LOOKUP_RESULT = { character: { name: 'Trollefar' }, history: [] };

function claimedJob(attempts = 1) {
  return { jobId: JOB_ID, name: 'Trollefar', requestedBySub: 'google-1', attempts };
}

describe('character lookup worker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMocks.findLatestCharacterLookup.mockResolvedValue(null);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('runCharacterLookupJob', () => {
    it('stores the lookup result as completed', async () => {
      serviceMocks.lookupCharacter.mockResolvedValue(LOOKUP_RESULT);
      const job = claimedJob();

      await expect(runCharacterLookupJob(job)).resolves.toBe('completed');
      expect(serviceMocks.lookupCharacter).toHaveBeenCalledWith('Trollefar', 'google-1');
      expect(jobMocks.completeCharacterLookupJob).toHaveBeenCalledWith(job, LOOKUP_RESULT);
    });

    it('returns a failed attempt to pending while attempts remain', async () => {
      serviceMocks.lookupCharacter.mockRejectedValue(new Error('upstream down'));
      const job = claimedJob(CHARACTER_LOOKUP_MAX_ATTEMPTS - 1);

      await expect(runCharacterLookupJob(job)).resolves.toBe('retried');
      expect(jobMocks.releaseCharacterLookupJobForRetry).toHaveBeenCalledWith(
        job,
        CharacterLookupJobErrorCode.FAILED,
      );
      expect(jobMocks.failCharacterLookupJob).not.toHaveBeenCalled();
    });

    it('fails the job after the last attempt', async () => {
      serviceMocks.lookupCharacter.mockRejectedValue(new Error('upstream down'));
      const job = claimedJob(CHARACTER_LOOKUP_MAX_ATTEMPTS);

      await expect(runCharacterLookupJob(job)).resolves.toBe('failed');
      expect(jobMocks.failCharacterLookupJob).toHaveBeenCalledWith(
        job,
        CharacterLookupJobErrorCode.FAILED,
      );
      expect(jobMocks.releaseCharacterLookupJobForRetry).not.toHaveBeenCalled();
    });

    it('answers with the stored lookup when TibiaData is unavailable', async () => {
      serviceMocks.lookupCharacter.mockRejectedValue(new Error('upstream down'));
      serviceMocks.findLatestCharacterLookup.mockResolvedValue(LOOKUP_RESULT);
      const job = claimedJob(1);

      await expect(runCharacterLookupJob(job)).resolves.toBe('cached');
      expect(jobMocks.completeCharacterLookupJob).toHaveBeenCalledWith(job, LOOKUP_RESULT);
      expect(jobMocks.releaseCharacterLookupJobForRetry).not.toHaveBeenCalled();
    });

    it('does not fall back to the stored lookup for a missing character', async () => {
      serviceMocks.lookupCharacter.mockRejectedValue(
        new tibiadataMocks.TibiaDataNotFoundError('not found'),
      );
      serviceMocks.findLatestCharacterLookup.mockResolvedValue(LOOKUP_RESULT);

      await expect(runCharacterLookupJob(claimedJob(1))).resolves.toBe('failed');
      expect(serviceMocks.findLatestCharacterLookup).not.toHaveBeenCalled();
    });

    it('fails a missing character immediately without retrying', async () => {
      serviceMocks.lookupCharacter.mockRejectedValue(
        new tibiadataMocks.TibiaDataNotFoundError('not found'),
      );
      const job = claimedJob(1);

      await expect(runCharacterLookupJob(job)).resolves.toBe('failed');
      expect(jobMocks.failCharacterLookupJob).toHaveBeenCalledWith(
        job,
        CharacterLookupJobErrorCode.NOT_FOUND,
      );
    });

    it('aborts a lookup that exceeds the timeout', async () => {
      vi.useFakeTimers();
      serviceMocks.lookupCharacter.mockReturnValue(new Promise(() => undefined));
      const job = claimedJob(1);

      const outcome = runCharacterLookupJob(job);
      await vi.advanceTimersByTimeAsync(CHARACTER_LOOKUP_TIMEOUT_MS);

      await expect(outcome).resolves.toBe('retried');
      expect(jobMocks.releaseCharacterLookupJobForRetry).toHaveBeenCalledWith(
        job,
        CharacterLookupJobErrorCode.TIMEOUT,
      );
      expect(jobMocks.completeCharacterLookupJob).not.toHaveBeenCalled();
    });
  });

  describe('processCharacterLookupJob', () => {
    it('runs the job when it is still pending', async () => {
      jobMocks.claimCharacterLookupJob.mockResolvedValue(claimedJob());
      serviceMocks.lookupCharacter.mockResolvedValue(LOOKUP_RESULT);

      await processCharacterLookupJob(JOB_ID);

      expect(jobMocks.claimCharacterLookupJob).toHaveBeenCalledWith(JOB_ID);
      expect(jobMocks.completeCharacterLookupJob).toHaveBeenCalledTimes(1);
    });

    it('skips a job already claimed by another worker', async () => {
      jobMocks.claimCharacterLookupJob.mockResolvedValue(null);

      await processCharacterLookupJob(JOB_ID);

      expect(serviceMocks.lookupCharacter).not.toHaveBeenCalled();
    });

    it('swallows database errors because it runs after the response', async () => {
      jobMocks.claimCharacterLookupJob.mockRejectedValue(new Error('db down'));

      await expect(processCharacterLookupJob(JOB_ID)).resolves.toBeUndefined();
    });
  });

  describe('processCharacterLookupBatch', () => {
    it('expires exhausted stuck jobs, reclaims the rest and reports outcomes', async () => {
      jobMocks.failExhaustedStuckJobs.mockResolvedValue(1);
      jobMocks.claimCharacterLookupJobs.mockResolvedValue([
        claimedJob(1),
        claimedJob(2),
        claimedJob(CHARACTER_LOOKUP_MAX_ATTEMPTS),
      ]);
      serviceMocks.lookupCharacter
        .mockResolvedValueOnce(LOOKUP_RESULT)
        .mockRejectedValueOnce(new Error('upstream down'))
        .mockRejectedValueOnce(new Error('upstream down'));

      const stats = await processCharacterLookupBatch(3);

      expect(jobMocks.claimCharacterLookupJobs).toHaveBeenCalledWith(3);
      expect(stats).toMatchObject({
        expired: 1,
        claimed: 3,
        completed: 1,
        retried: 1,
        failed: 1,
      });
    });
  });
});
