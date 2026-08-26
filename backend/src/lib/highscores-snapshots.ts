import type { HighscoresSnapshotRecordDto } from '@shared/api-contract';
import { getSql } from './db';
import { ErrorCode } from './errors';
import { logError, logWarn } from './logger';

export interface HighscoresSnapshot {
  characterName: string;
  world: string;
  vocation: string;
  level: number;
  rank: number;
  exactExperience: number;
}

export interface LatestHighscoresSnapshot {
  exactExperience: number;
  rank: number;
  vocation: string;
  checkedAt: string;
}

interface HighscoresSnapshotListRow {
  id: number;
  characterName: string;
  world: string;
  vocation: string;
  level: number;
  rank: number;
  exactExperience: number;
  checkedAt: string;
}

const SAVE_BUCKET_MS = 15 * 60 * 1000;

export interface HighscoresSnapshotsListResult {
  data: HighscoresSnapshotRecordDto[];
  total: number;
  worlds: string[];
}

/**
 * Round timestamp to nearest 15-minute interval
 * 10:00, 10:15, 10:30, 10:45, 11:00, etc.
 */
function roundTo15MinBucket(timestamp: Date): Date {
  const ms = timestamp.getTime();
  const rounded = Math.floor(ms / SAVE_BUCKET_MS) * SAVE_BUCKET_MS;
  return new Date(rounded);
}

/**
 * Check if character should be saved (15-min bucketing)
 */
async function shouldSaveCharacter(normalizedName: string, world: string): Promise<boolean> {
  try {
    const sql = getSql();
    const result = (await sql`
      SELECT last_save_bucket FROM character_highscores_last_save 
      WHERE normalized_name = ${normalizedName.toLowerCase()} AND world = ${world}
    `) as Array<{ last_save_bucket: string }>;

    if (!result.length) {
      return true; // Not saved before
    }

    const lastBucket = new Date(result[0].last_save_bucket);
    const currentBucket = roundTo15MinBucket(new Date());
    return lastBucket.getTime() !== currentBucket.getTime();
  } catch (error) {
    logWarn(
      'highscores.saveSnapshots',
      ErrorCode.DB_QUERY_FAILED,
      { reason: 'Error checking last save' },
      error,
    );
    return true;
  }
}

/**
 * Save characters from highscores snapshot
 */
export async function saveHighscoresSnapshots(snapshots: HighscoresSnapshot[]): Promise<void> {
  if (!snapshots.length) {
    return;
  }

  const now = new Date();
  const currentBucket = roundTo15MinBucket(now);

  const charactersToSave: HighscoresSnapshot[] = [];

  for (const snapshot of snapshots) {
    const shouldSave = await shouldSaveCharacter(snapshot.characterName, snapshot.world);
    if (shouldSave) {
      charactersToSave.push(snapshot);
    }
  }

  if (!charactersToSave.length) {
    return;
  }

  try {
    const sql = getSql();

    // Insert snapshots
    for (const snapshot of charactersToSave) {
      await sql`
        INSERT INTO character_highscores_snapshots 
        (character_name, normalized_name, world, vocation, level, rank, exact_experience, checked_at)
        VALUES (${snapshot.characterName}, ${snapshot.characterName.toLowerCase()}, ${snapshot.world}, 
                ${snapshot.vocation}, ${snapshot.level}, ${snapshot.rank}, ${snapshot.exactExperience}, ${now})
      `;
    }

    // Update last save buckets
    for (const snapshot of charactersToSave) {
      const normalizedName = snapshot.characterName.toLowerCase();
      await sql`
        INSERT INTO character_highscores_last_save (normalized_name, world, last_save_bucket)
        VALUES (${normalizedName}, ${snapshot.world}, ${currentBucket})
        ON CONFLICT (normalized_name, world) DO UPDATE 
        SET last_save_bucket = ${currentBucket}
      `;
    }
  } catch (error) {
    logError(
      'highscores.saveSnapshots',
      ErrorCode.DB_QUERY_FAILED,
      { reason: 'Error saving snapshots' },
      error,
    );
    throw error;
  }
}

export async function getLatestHighscoresSnapshot(
  characterName: string,
  world: string,
): Promise<LatestHighscoresSnapshot | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT exact_experience AS "exactExperience",
           rank,
           vocation,
           to_char(checked_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "checkedAt"
    FROM character_highscores_snapshots
    WHERE normalized_name = ${characterName.toLowerCase()}
      AND world = ${world}
    ORDER BY checked_at DESC
    LIMIT 1
  `) as LatestHighscoresSnapshot[];

  if (!rows.length) {
    return null;
  }

  return rows[0];
}

export async function listHighscoresSnapshots(
  page: number,
  pageSize: number,
  world: string | null,
  sortDir: 'asc' | 'desc',
): Promise<HighscoresSnapshotsListResult> {
  const sql = getSql();
  const offset = (page - 1) * pageSize;
  const normalizedWorld = world?.trim() ?? null;

  let rows: HighscoresSnapshotListRow[];
  let countRows: Array<{ total: string | number }>;

  if (normalizedWorld) {
    if (sortDir === 'asc') {
      rows = (await sql`
        SELECT id,
               character_name AS "characterName",
               world,
               vocation,
               level,
               rank,
               exact_experience AS "exactExperience",
               to_char(checked_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "checkedAt"
        FROM character_highscores_snapshots
        WHERE world = ${normalizedWorld}
        ORDER BY level ASC, checked_at DESC
        LIMIT ${pageSize}
        OFFSET ${offset}
      `) as HighscoresSnapshotListRow[];
    } else {
      rows = (await sql`
        SELECT id,
               character_name AS "characterName",
               world,
               vocation,
               level,
               rank,
               exact_experience AS "exactExperience",
               to_char(checked_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "checkedAt"
        FROM character_highscores_snapshots
        WHERE world = ${normalizedWorld}
        ORDER BY level DESC, checked_at DESC
        LIMIT ${pageSize}
        OFFSET ${offset}
      `) as HighscoresSnapshotListRow[];
    }

    countRows = (await sql`
      SELECT COUNT(*)::text AS total
      FROM character_highscores_snapshots
      WHERE world = ${normalizedWorld}
    `) as Array<{ total: string | number }>;
  } else {
    if (sortDir === 'asc') {
      rows = (await sql`
        SELECT id,
               character_name AS "characterName",
               world,
               vocation,
               level,
               rank,
               exact_experience AS "exactExperience",
               to_char(checked_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "checkedAt"
        FROM character_highscores_snapshots
        ORDER BY level ASC, checked_at DESC
        LIMIT ${pageSize}
        OFFSET ${offset}
      `) as HighscoresSnapshotListRow[];
    } else {
      rows = (await sql`
        SELECT id,
               character_name AS "characterName",
               world,
               vocation,
               level,
               rank,
               exact_experience AS "exactExperience",
               to_char(checked_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "checkedAt"
        FROM character_highscores_snapshots
        ORDER BY level DESC, checked_at DESC
        LIMIT ${pageSize}
        OFFSET ${offset}
      `) as HighscoresSnapshotListRow[];
    }

    countRows = (await sql`
      SELECT COUNT(*)::text AS total
      FROM character_highscores_snapshots
    `) as Array<{ total: string | number }>;
  }

  const worldRows = (await sql`
    SELECT DISTINCT world
    FROM character_highscores_snapshots
    ORDER BY world ASC
  `) as Array<{ world: string }>;

  const totalRaw = countRows[0]?.total ?? 0;
  const total = typeof totalRaw === 'string' ? Number.parseInt(totalRaw, 10) : Number(totalRaw);

  return {
    data: rows.map((row) => ({
      id: row.id,
      characterName: row.characterName,
      world: row.world,
      vocation: row.vocation,
      level: row.level,
      rank: row.rank,
      exactExperience: row.exactExperience,
      checkedAt: row.checkedAt,
    })),
    total,
    worlds: worldRows.map((row) => row.world),
  };
}
