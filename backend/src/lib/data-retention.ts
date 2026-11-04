import { getSql } from './db';

const DEFAULT_SNAPSHOT_RETENTION_DAYS = 365;
const DEFAULT_LOOKUP_RETENTION_DAYS = 90;

export interface PruneResult extends Record<string, unknown> {
  snapshotsDeleted: number;
  lookupsDeleted: number;
}

function readRetentionDays(variableName: string, fallback: number): number {
  const raw = Number(process.env[variableName]?.trim());
  return Number.isInteger(raw) && raw > 0 ? raw : fallback;
}

/**
 * Deletes history older than the configured retention. The snapshot referenced
 * by `character_highscores_latest` is kept, so every listed character still has
 * at least one row to show.
 */
export async function pruneExpiredHistory(): Promise<PruneResult> {
  const snapshotDays = readRetentionDays(
    'HIGHSCORES_SNAPSHOT_RETENTION_DAYS',
    DEFAULT_SNAPSHOT_RETENTION_DAYS,
  );
  const lookupDays = readRetentionDays(
    'CHARACTER_LOOKUP_RETENTION_DAYS',
    DEFAULT_LOOKUP_RETENTION_DAYS,
  );
  const sql = getSql();

  const snapshotRows = (await sql`
    WITH deleted AS (
      DELETE FROM character_highscores_snapshots AS snapshots
      WHERE snapshots.checked_at < (now() AT TIME ZONE 'UTC') - make_interval(days => ${snapshotDays})
        AND NOT EXISTS (
          SELECT 1
          FROM character_highscores_latest AS latest
          WHERE latest.snapshot_id = snapshots.id
        )
      RETURNING 1
    )
    SELECT COUNT(*)::int AS deleted FROM deleted
  `) as Array<{ deleted: number }>;

  const lookupRows = (await sql`
    WITH deleted AS (
      DELETE FROM character_lookups
      WHERE checked_at < now() - make_interval(days => ${lookupDays})
      RETURNING 1
    )
    SELECT COUNT(*)::int AS deleted FROM deleted
  `) as Array<{ deleted: number }>;

  return {
    snapshotsDeleted: snapshotRows[0]?.deleted ?? 0,
    lookupsDeleted: lookupRows[0]?.deleted ?? 0,
  };
}
