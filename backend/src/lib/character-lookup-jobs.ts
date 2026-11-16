import type {
  CharacterLookupJobDto,
  CharacterLookupJobErrorCode as CharacterLookupJobErrorCodeValue,
  CharacterLookupJobStatus,
  TibiaCharacterLookupDto,
} from '@shared/api-contract';
import { normalizeCharacterName } from './character-lookups';
import { getSql } from './db';
import { toIsoUtc, toIsoUtcOrNull, type SqlTimestamp } from './date-time';
import { CharacterLookupJobState } from './validation';

/** Upper bound of pending + processing jobs; new lookups beyond it are rejected with 429. */
export const CHARACTER_LOOKUP_MAX_ACTIVE_JOBS = 200;
export const CHARACTER_LOOKUP_MAX_ATTEMPTS = 3;
/** Must stay above the worker timeout, otherwise a still-running job would be reclaimed. */
export const CHARACTER_LOOKUP_STUCK_AFTER_SECONDS = 300;

/** Stored in `character_lookup_jobs.error`; the API adds a readable message. */
export const CharacterLookupJobErrorCode = {
  NOT_FOUND: 'CHARACTER_NOT_FOUND',
  TIMEOUT: 'CHARACTER_LOOKUP_TIMEOUT',
  FAILED: 'CHARACTER_LOOKUP_FAILED',
  STUCK: 'CHARACTER_LOOKUP_STUCK',
} as const satisfies Record<string, CharacterLookupJobErrorCodeValue>;

const CHARACTER_LOOKUP_JOB_ERROR_MESSAGES: Record<CharacterLookupJobErrorCodeValue, string> = {
  CHARACTER_NOT_FOUND: 'Character not found',
  CHARACTER_LOOKUP_TIMEOUT: 'Character lookup timed out',
  CHARACTER_LOOKUP_FAILED: 'Character lookup failed',
  CHARACTER_LOOKUP_STUCK: 'Character lookup did not finish in time',
};

interface CharacterLookupJobRow {
  jobId: string;
  name: string;
  requestedBySub: string | null;
  status: CharacterLookupJobStatus;
  attempts: number;
  result: TibiaCharacterLookupDto | null;
  error: CharacterLookupJobErrorCodeValue | null;
  createdAt: SqlTimestamp;
  startedAt: SqlTimestamp | null;
  finishedAt: SqlTimestamp | null;
}

interface ActiveJobsCountRow {
  total: number | string;
}

export interface ClaimedCharacterLookupJob {
  jobId: string;
  name: string;
  requestedBySub: string | null;
  attempts: number;
}

export type EnqueueCharacterLookupResult =
  { kind: 'created' | 'existing'; job: CharacterLookupJobDto } | { kind: 'queue-full' };

export function mapCharacterLookupJobRow(row: CharacterLookupJobRow): CharacterLookupJobDto {
  return {
    jobId: row.jobId,
    status: row.status,
    ...(row.result ? { result: row.result } : {}),
    ...(row.error
      ? { errorCode: row.error, error: CHARACTER_LOOKUP_JOB_ERROR_MESSAGES[row.error] }
      : {}),
    createdAt: toIsoUtc(row.createdAt),
    startedAt: toIsoUtcOrNull(row.startedAt),
    finishedAt: toIsoUtcOrNull(row.finishedAt),
  };
}

function mapClaimedRow(row: CharacterLookupJobRow): ClaimedCharacterLookupJob {
  return {
    jobId: row.jobId,
    name: row.name,
    requestedBySub: row.requestedBySub,
    attempts: row.attempts,
  };
}

async function findActiveJob(normalizedName: string): Promise<CharacterLookupJobDto | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id AS "jobId",
           name,
           requested_by_sub AS "requestedBySub",
           status,
           attempts,
           result,
           error,
           created_at AS "createdAt",
           started_at AS "startedAt",
           finished_at AS "finishedAt"
    FROM character_lookup_jobs
    WHERE normalized_name = ${normalizedName}
      AND status IN (${CharacterLookupJobState.PENDING}, ${CharacterLookupJobState.PROCESSING})
    LIMIT 1
  `) as CharacterLookupJobRow[];

  return rows.length ? mapCharacterLookupJobRow(rows[0]) : null;
}

async function countActiveJobs(): Promise<number> {
  const sql = getSql();
  const rows = (await sql`
    SELECT COUNT(*) AS total
    FROM character_lookup_jobs
    WHERE status IN (${CharacterLookupJobState.PENDING}, ${CharacterLookupJobState.PROCESSING})
  `) as ActiveJobsCountRow[];

  return rows.length ? Number(rows[0].total) : 0;
}

/** Returns null when a concurrent request inserted the active job first (partial unique index). */
async function insertPendingJob(
  name: string,
  normalizedName: string,
  requestedBySub: string | null,
): Promise<CharacterLookupJobDto | null> {
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO character_lookup_jobs (name, normalized_name, requested_by_sub, status)
    VALUES (${name}, ${normalizedName}, ${requestedBySub}, ${CharacterLookupJobState.PENDING})
    ON CONFLICT DO NOTHING
    RETURNING id AS "jobId",
              name,
              requested_by_sub AS "requestedBySub",
              status,
              attempts,
              result,
              error,
              created_at AS "createdAt",
              started_at AS "startedAt",
              finished_at AS "finishedAt"
  `) as CharacterLookupJobRow[];

  return rows.length ? mapCharacterLookupJobRow(rows[0]) : null;
}

export async function enqueueCharacterLookupJob(
  name: string,
  requestedBySub: string | null,
): Promise<EnqueueCharacterLookupResult> {
  const normalizedName = normalizeCharacterName(name);
  const activeJob = await findActiveJob(normalizedName);
  if (activeJob) {
    return { kind: 'existing', job: activeJob };
  }

  if ((await countActiveJobs()) >= CHARACTER_LOOKUP_MAX_ACTIVE_JOBS) {
    return { kind: 'queue-full' };
  }

  const createdJob = await insertPendingJob(name, normalizedName, requestedBySub);
  if (createdJob) {
    return { kind: 'created', job: createdJob };
  }

  const concurrentJob = await findActiveJob(normalizedName);
  if (!concurrentJob) {
    throw new Error(`Could not enqueue character lookup for ${normalizedName}`);
  }
  return { kind: 'existing', job: concurrentJob };
}

export async function getCharacterLookupJob(jobId: string): Promise<CharacterLookupJobDto | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id AS "jobId",
           name,
           requested_by_sub AS "requestedBySub",
           status,
           attempts,
           result,
           error,
           created_at AS "createdAt",
           started_at AS "startedAt",
           finished_at AS "finishedAt"
    FROM character_lookup_jobs
    WHERE id = ${jobId}
  `) as CharacterLookupJobRow[];

  return rows.length ? mapCharacterLookupJobRow(rows[0]) : null;
}

/**
 * Atomically moves up to `limit` pending jobs, plus processing jobs abandoned for
 * longer than the stuck timeout, to processing. SKIP LOCKED lets parallel workers
 * claim disjoint batches.
 */
export async function claimCharacterLookupJobs(
  limit: number,
): Promise<ClaimedCharacterLookupJob[]> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE character_lookup_jobs
    SET status = ${CharacterLookupJobState.PROCESSING},
        attempts = attempts + 1,
        started_at = now(),
        finished_at = NULL
    WHERE id IN (
      SELECT id
      FROM character_lookup_jobs
      WHERE attempts < ${CHARACTER_LOOKUP_MAX_ATTEMPTS}
        AND (
          status = ${CharacterLookupJobState.PENDING}
          OR (
            status = ${CharacterLookupJobState.PROCESSING}
            AND started_at < now() - (${CHARACTER_LOOKUP_STUCK_AFTER_SECONDS} * INTERVAL '1 second')
          )
        )
      ORDER BY created_at
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id AS "jobId",
              name,
              requested_by_sub AS "requestedBySub",
              status,
              attempts,
              result,
              error,
              created_at AS "createdAt",
              started_at AS "startedAt",
              finished_at AS "finishedAt"
  `) as CharacterLookupJobRow[];

  return rows.map(mapClaimedRow);
}

/** Claims one specific pending job; returns null when another worker already took it. */
export async function claimCharacterLookupJob(
  jobId: string,
): Promise<ClaimedCharacterLookupJob | null> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE character_lookup_jobs
    SET status = ${CharacterLookupJobState.PROCESSING},
        attempts = attempts + 1,
        started_at = now(),
        finished_at = NULL
    WHERE id IN (
      SELECT id
      FROM character_lookup_jobs
      WHERE id = ${jobId}
        AND status = ${CharacterLookupJobState.PENDING}
        AND attempts < ${CHARACTER_LOOKUP_MAX_ATTEMPTS}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id AS "jobId",
              name,
              requested_by_sub AS "requestedBySub",
              status,
              attempts,
              result,
              error,
              created_at AS "createdAt",
              started_at AS "startedAt",
              finished_at AS "finishedAt"
  `) as CharacterLookupJobRow[];

  return rows.length ? mapClaimedRow(rows[0]) : null;
}

/** Fails processing jobs that got stuck after using their last attempt. */
export async function failExhaustedStuckJobs(): Promise<number> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE character_lookup_jobs
    SET status = ${CharacterLookupJobState.FAILED},
        error = ${CharacterLookupJobErrorCode.STUCK},
        finished_at = now()
    WHERE status = ${CharacterLookupJobState.PROCESSING}
      AND attempts >= ${CHARACTER_LOOKUP_MAX_ATTEMPTS}
      AND started_at < now() - (${CHARACTER_LOOKUP_STUCK_AFTER_SECONDS} * INTERVAL '1 second')
    RETURNING id
  `) as Array<{ id: string }>;

  return rows.length;
}

// Every finishing update matches the claimed attempt number, so a worker whose job
// was reclaimed after getting stuck cannot overwrite the newer attempt's outcome.

export async function completeCharacterLookupJob(
  job: ClaimedCharacterLookupJob,
  result: TibiaCharacterLookupDto,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE character_lookup_jobs
    SET status = ${CharacterLookupJobState.COMPLETED},
        result = CAST(${JSON.stringify(result)} AS jsonb),
        error = NULL,
        finished_at = now()
    WHERE id = ${job.jobId}
      AND status = ${CharacterLookupJobState.PROCESSING}
      AND attempts = ${job.attempts}
  `;
}

export async function releaseCharacterLookupJobForRetry(
  job: ClaimedCharacterLookupJob,
  errorCode: CharacterLookupJobErrorCodeValue,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE character_lookup_jobs
    SET status = ${CharacterLookupJobState.PENDING},
        error = ${errorCode}
    WHERE id = ${job.jobId}
      AND status = ${CharacterLookupJobState.PROCESSING}
      AND attempts = ${job.attempts}
  `;
}

export async function failCharacterLookupJob(
  job: ClaimedCharacterLookupJob,
  errorCode: CharacterLookupJobErrorCodeValue,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE character_lookup_jobs
    SET status = ${CharacterLookupJobState.FAILED},
        error = ${errorCode},
        finished_at = now()
    WHERE id = ${job.jobId}
      AND status = ${CharacterLookupJobState.PROCESSING}
      AND attempts = ${job.attempts}
  `;
}
