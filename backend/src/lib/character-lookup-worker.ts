import type { CronCharacterLookupsStatsDto } from '@shared/api-contract';
import {
  CHARACTER_LOOKUP_MAX_ATTEMPTS,
  CharacterLookupJobErrorCode,
  claimCharacterLookupJob,
  claimCharacterLookupJobs,
  completeCharacterLookupJob,
  failCharacterLookupJob,
  failExhaustedStuckJobs,
  releaseCharacterLookupJobForRetry,
  type ClaimedCharacterLookupJob,
} from './character-lookup-jobs';
import {
  CharacterLookupStorageError,
  findLatestCharacterLookup,
  lookupCharacter,
} from './character-lookup-service';
import { ErrorCode } from './errors';
import { logError, logInfo, logWarn } from './logger';
import { TibiaDataNotFoundError } from './tibiadata';

/** Kept well below CHARACTER_LOOKUP_STUCK_AFTER_SECONDS and the routes' maxDuration. */
export const CHARACTER_LOOKUP_TIMEOUT_MS = 45_000;
export const CHARACTER_LOOKUP_BATCH_SIZE = 5;

export type CharacterLookupJobOutcome = 'completed' | 'cached' | 'retried' | 'failed';

type JobErrorCode = (typeof CharacterLookupJobErrorCode)[keyof typeof CharacterLookupJobErrorCode];

export class CharacterLookupTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Character lookup exceeded ${timeoutMs} ms`);
    this.name = 'CharacterLookupTimeoutError';
  }
}

/**
 * TibiaData requests cannot take an external AbortSignal, so the abort only
 * releases the worker; the abandoned request finishes on its own timeout.
 */
async function runWithTimeout<T>(task: () => Promise<T>, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new CharacterLookupTimeoutError(timeoutMs)),
    timeoutMs,
  );
  const aborted = new Promise<never>((_, reject) => {
    controller.signal.addEventListener('abort', () => reject(controller.signal.reason), {
      once: true,
    });
  });

  try {
    return await Promise.race([task(), aborted]);
  } finally {
    clearTimeout(timer);
  }
}

function describeFailure(error: unknown): JobErrorCode {
  if (error instanceof TibiaDataNotFoundError) {
    return CharacterLookupJobErrorCode.NOT_FOUND;
  }
  if (error instanceof CharacterLookupTimeoutError) {
    return CharacterLookupJobErrorCode.TIMEOUT;
  }
  return CharacterLookupJobErrorCode.FAILED;
}

/** TibiaData being slow or down is answered with the newest stored lookup, if any. */
function canFallBackToStoredLookup(error: unknown): boolean {
  return (
    !(error instanceof TibiaDataNotFoundError) && !(error instanceof CharacterLookupStorageError)
  );
}

async function completeWithStoredLookup(job: ClaimedCharacterLookupJob): Promise<boolean> {
  try {
    const storedLookup = await findLatestCharacterLookup(job.name);
    if (!storedLookup) {
      return false;
    }
    await completeCharacterLookupJob(job, storedLookup);
    return true;
  } catch (error) {
    logError('characterLookupJob.fallback', ErrorCode.DB_QUERY_FAILED, { jobId: job.jobId }, error);
    return false;
  }
}

function canRetry(job: ClaimedCharacterLookupJob, error: unknown): boolean {
  return !(error instanceof TibiaDataNotFoundError) && job.attempts < CHARACTER_LOOKUP_MAX_ATTEMPTS;
}

async function settleFailedJob(
  job: ClaimedCharacterLookupJob,
  error: unknown,
): Promise<CharacterLookupJobOutcome> {
  const errorCode = describeFailure(error);
  const context = { jobId: job.jobId, name: job.name, attempts: job.attempts };

  if (canFallBackToStoredLookup(error) && (await completeWithStoredLookup(job))) {
    logWarn('characterLookupJob.cached', ErrorCode.INTERNAL_ERROR, context, error);
    return 'cached';
  }

  if (canRetry(job, error)) {
    logWarn('characterLookupJob.retry', ErrorCode.INTERNAL_ERROR, context, error);
    await releaseCharacterLookupJobForRetry(job, errorCode);
    return 'retried';
  }

  logError('characterLookupJob.failed', ErrorCode.INTERNAL_ERROR, context, error);
  await failCharacterLookupJob(job, errorCode);
  return 'failed';
}

export async function runCharacterLookupJob(
  job: ClaimedCharacterLookupJob,
): Promise<CharacterLookupJobOutcome> {
  try {
    const result = await runWithTimeout(
      () => lookupCharacter(job.name, job.requestedBySub),
      CHARACTER_LOOKUP_TIMEOUT_MS,
    );
    await completeCharacterLookupJob(job, result);
    return 'completed';
  } catch (error) {
    return settleFailedJob(job, error);
  }
}

/** Processes one freshly enqueued job; a no-op when another worker already claimed it. */
export async function processCharacterLookupJob(jobId: string): Promise<void> {
  try {
    const job = await claimCharacterLookupJob(jobId);
    if (job) {
      await runCharacterLookupJob(job);
    }
  } catch (error) {
    logError('characterLookupJob.process', ErrorCode.DB_QUERY_FAILED, { jobId }, error);
  }
}

export async function processCharacterLookupBatch(
  batchSize: number = CHARACTER_LOOKUP_BATCH_SIZE,
): Promise<CronCharacterLookupsStatsDto> {
  const startTime = Date.now();
  const expired = await failExhaustedStuckJobs();
  const jobs = await claimCharacterLookupJobs(batchSize);
  const stats: CronCharacterLookupsStatsDto = {
    expired,
    claimed: jobs.length,
    completed: 0,
    cached: 0,
    retried: 0,
    failed: 0,
    duration: 0,
  };

  // Sequential on purpose: TibiaData is rate limited and each lookup already fans out.
  for (const job of jobs) {
    stats[await runCharacterLookupJob(job)] += 1;
  }

  stats.duration = Date.now() - startTime;
  logInfo('characterLookupJob.batch', 'Processed character lookup batch', { ...stats });
  return stats;
}
