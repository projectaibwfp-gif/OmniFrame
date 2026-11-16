import { getSql } from './db';

const DEFAULT_SNAPSHOT_RETENTION_DAYS = 30;
const DEFAULT_LOOKUP_RETENTION_DAYS = 30;
// Finished jobs only serve the polling client; their JSONB results are not history.
const FINISHED_LOOKUP_JOB_RETENTION_DAYS = 1;
const UTC_TIME_ZONE = 'UTC';

export interface PruneResult extends Record<string, unknown> {
  snapshotsRolledUp: number;
  lookupsDeleted: number;
  lookupJobsDeleted: number;
}

interface DeletedCountRow {
  deleted: number;
}

function readRetentionDays(variableName: string, fallback: number): number {
  const raw = Number(process.env[variableName]?.trim());
  return Number.isInteger(raw) && raw > 0 ? raw : fallback;
}

function readDeletedCount(rows: DeletedCountRow[]): number {
  return rows[0]?.deleted ?? 0;
}

/**
 * Moves snapshots older than the retention window into one experience value per
 * character, world and UTC month, then deletes them. The snapshot referenced by
 * `character_highscores_latest` stays, so every listed character keeps a row.
 * Across runs the newest snapshot of a month wins (`recorded_at`).
 */
async function rollUpExpiredSnapshots(retentionDays: number): Promise<number> {
  const rows = (await getSql()`
    WITH expired AS (
      DELETE FROM character_highscores_snapshots AS snapshots
      WHERE snapshots.checked_at < now() - make_interval(days => ${retentionDays})
        AND NOT EXISTS (
          SELECT 1
          FROM character_highscores_latest AS latest
          WHERE latest.snapshot_id = snapshots.id
        )
      RETURNING normalized_name, world, character_name, exact_experience, checked_at
    ),
    monthly AS (
      SELECT DISTINCT ON (normalized_name, world, month)
             normalized_name, world, month, character_name, exact_experience, checked_at
      FROM (
        SELECT expired.*, date_trunc('month', checked_at, ${UTC_TIME_ZONE})::date AS month
        FROM expired
      ) AS with_month
      ORDER BY normalized_name, world, month, checked_at DESC
    ),
    upserted AS (
      INSERT INTO character_highscores_monthly
        (normalized_name, world, month, character_name, exact_experience, recorded_at)
      SELECT normalized_name, world, month, character_name, exact_experience, checked_at
      FROM monthly
      ON CONFLICT (normalized_name, world, month) DO UPDATE
      SET character_name = EXCLUDED.character_name,
          exact_experience = EXCLUDED.exact_experience,
          recorded_at = EXCLUDED.recorded_at
      WHERE character_highscores_monthly.recorded_at < EXCLUDED.recorded_at
      RETURNING 1
    )
    SELECT COUNT(*)::int AS deleted FROM expired
  `) as DeletedCountRow[];

  return readDeletedCount(rows);
}

/** The newest lookup of a character always stays as the fallback when TibiaData is down. */
async function deleteExpiredLookups(retentionDays: number): Promise<number> {
  const rows = (await getSql()`
    WITH deleted AS (
      DELETE FROM character_lookups AS lookups
      WHERE lookups.checked_at < now() - make_interval(days => ${retentionDays})
        AND EXISTS (
          SELECT 1
          FROM character_lookups AS newer
          WHERE newer.normalized_name = lookups.normalized_name
            AND newer.checked_at > lookups.checked_at
        )
      RETURNING 1
    )
    SELECT COUNT(*)::int AS deleted FROM deleted
  `) as DeletedCountRow[];

  return readDeletedCount(rows);
}

async function deleteFinishedLookupJobs(): Promise<number> {
  const rows = (await getSql()`
    WITH deleted AS (
      DELETE FROM character_lookup_jobs
      WHERE status IN ('completed', 'failed')
        AND finished_at < now() - make_interval(days => ${FINISHED_LOOKUP_JOB_RETENTION_DAYS})
      RETURNING 1
    )
    SELECT COUNT(*)::int AS deleted FROM deleted
  `) as DeletedCountRow[];

  return readDeletedCount(rows);
}

export async function pruneExpiredHistory(): Promise<PruneResult> {
  return {
    snapshotsRolledUp: await rollUpExpiredSnapshots(
      readRetentionDays('HIGHSCORES_SNAPSHOT_RETENTION_DAYS', DEFAULT_SNAPSHOT_RETENTION_DAYS),
    ),
    lookupsDeleted: await deleteExpiredLookups(
      readRetentionDays('CHARACTER_LOOKUP_RETENTION_DAYS', DEFAULT_LOOKUP_RETENTION_DAYS),
    ),
    lookupJobsDeleted: await deleteFinishedLookupJobs(),
  };
}
