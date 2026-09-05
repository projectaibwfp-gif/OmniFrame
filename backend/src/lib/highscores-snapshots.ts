import type { HighscoresSnapshotRecordDto } from '@shared/api-contract';
import { getSql } from './db';
import { toIsoUtc, type SqlTimestamp } from './date-time';
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

interface LatestHighscoresSnapshotRow extends Omit<LatestHighscoresSnapshot, 'checkedAt'> {
  checkedAt: SqlTimestamp;
}

interface HighscoresSnapshotListRow {
  id: number;
  characterName: string;
  world: string;
  vocation: string;
  level: number;
  rank: number;
  exactExperience: number;
  checkedAt: SqlTimestamp;
}

export interface HighscoresSnapshotsListResult {
  data: HighscoresSnapshotRecordDto[];
  total: number;
  worlds: string[];
}

/**
 * Save characters from highscores snapshot
 * Only saves if level, vocation, or world changed since last snapshot for that character
 */
export async function saveHighscoresSnapshots(snapshots: HighscoresSnapshot[]): Promise<void> {
  if (!snapshots.length) {
    return;
  }

  const now = new Date();

  try {
    const sql = getSql();

    for (const snapshot of snapshots) {
      // Get latest snapshot for this character on this world
      const lastSnapshot = (await sql`
        SELECT exact_experience
        FROM character_highscores_snapshots
        WHERE normalized_name = ${snapshot.characterName.toLowerCase()} AND world = ${snapshot.world}
        ORDER BY checked_at DESC
        LIMIT 1
      `) as Array<{ exact_experience: number }>;

      // Only save if this is first snapshot OR EXP changed
      const hasExpChanged =
        !lastSnapshot.length || lastSnapshot[0].exact_experience !== snapshot.exactExperience;

      if (!hasExpChanged) {
        // EXP is identical to last snapshot - skip to avoid duplicate
        continue;
      }

      // EXP changed - save this snapshot
      await sql`
        INSERT INTO character_highscores_snapshots 
        (character_name, normalized_name, world, vocation, level, rank, exact_experience, checked_at)
        VALUES (${snapshot.characterName}, ${snapshot.characterName.toLowerCase()}, ${snapshot.world}, 
                ${snapshot.vocation}, ${snapshot.level}, ${snapshot.rank}, ${snapshot.exactExperience}, ${now})
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
           checked_at AS "checkedAt"
    FROM character_highscores_snapshots
    WHERE normalized_name = ${characterName.toLowerCase()}
      AND world = ${world}
    ORDER BY checked_at DESC
    LIMIT 1
  `) as LatestHighscoresSnapshotRow[];

  if (!rows.length) {
    return null;
  }

  return { ...rows[0], checkedAt: toIsoUtc(rows[0].checkedAt) };
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
               checked_at AS "checkedAt"
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
               checked_at AS "checkedAt"
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
               checked_at AS "checkedAt"
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
               checked_at AS "checkedAt"
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
      checkedAt: toIsoUtc(row.checkedAt),
    })),
    total,
    worlds: worldRows.map((row) => row.world),
  };
}
