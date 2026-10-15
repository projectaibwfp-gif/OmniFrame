import type { HighscoresSnapshotRecordDto, HighscoresSnapshotsListDto } from '@shared/api-contract';
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

export const CHARACTER_HIGHSCORES_HISTORY_LIMIT = 500;

interface HighscoresSnapshotRow {
  id: number;
  characterName: string;
  world: string;
  vocation: string;
  level: number;
  rank: number;
  exactExperience: number;
  checkedAt: SqlTimestamp;
}

type HighscoresSortDirection = HighscoresSnapshotsListDto['sortDir'];

export interface HighscoresSnapshotsListResult {
  data: HighscoresSnapshotRecordDto[];
  total: number;
  worlds: string[];
}

/**
 * Persists highscores entries. An entry is stored only when it is the first one
 * for that character on that world or when its exact experience differs from the
 * latest stored snapshot - unchanged entries are skipped to avoid duplicates.
 */
export async function saveHighscoresSnapshots(snapshots: HighscoresSnapshot[]): Promise<void> {
  if (!snapshots.length) {
    return;
  }

  const now = new Date();

  try {
    const sql = getSql();

    for (const snapshot of snapshots) {
      const lastSnapshot = (await sql`
        SELECT exact_experience
        FROM character_highscores_snapshots
        WHERE normalized_name = ${snapshot.characterName.toLowerCase()} AND world = ${snapshot.world}
        ORDER BY checked_at DESC
        LIMIT 1
      `) as Array<{ exact_experience: number }>;

      const hasExpChanged =
        !lastSnapshot.length || lastSnapshot[0].exact_experience !== snapshot.exactExperience;

      if (!hasExpChanged) {
        continue;
      }

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

function mapSnapshotRow(row: HighscoresSnapshotRow): HighscoresSnapshotRecordDto {
  return {
    id: row.id,
    characterName: row.characterName,
    world: row.world,
    vocation: row.vocation,
    level: row.level,
    rank: row.rank,
    exactExperience: row.exactExperience,
    checkedAt: toIsoUtc(row.checkedAt),
  };
}

export async function listCharacterHighscoresHistory(
  characterName: string,
): Promise<HighscoresSnapshotRecordDto[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id,
           character_name AS "characterName",
           world,
           vocation,
           level,
           rank,
           exact_experience AS "exactExperience",
           checked_at AS "checkedAt"
    FROM character_highscores_snapshots
    WHERE normalized_name = ${characterName.toLowerCase()}
    ORDER BY checked_at DESC
    LIMIT ${CHARACTER_HIGHSCORES_HISTORY_LIMIT}
  `) as HighscoresSnapshotRow[];

  return rows.map(mapSnapshotRow);
}

/**
 * Pages characters (one row per character and world) ordered by their latest
 * level, and returns every stored snapshot of the characters on that page.
 * `sortDir` is bound as a value and switches between the two CASE sort keys,
 * because SQL fragments cannot be interpolated into the Neon tagged template.
 */
export async function listHighscoresSnapshots(
  page: number,
  pageSize: number,
  world: string | null,
  sortDir: HighscoresSortDirection,
): Promise<HighscoresSnapshotsListResult> {
  const sql = getSql();
  const offset = (page - 1) * pageSize;

  const rows = (await sql`
    WITH latest_per_character AS (
      SELECT DISTINCT ON (normalized_name, world)
             id AS "latestId",
             normalized_name,
             world,
             level AS "latestLevel",
             checked_at AS "latestCheckedAt"
      FROM character_highscores_snapshots
      WHERE world = COALESCE(${world}, world)
      ORDER BY normalized_name, world, checked_at DESC, id DESC
    ),
    paged_characters AS (
      SELECT normalized_name,
             world,
             "latestId",
             "latestLevel",
             "latestCheckedAt"
      FROM latest_per_character
      ORDER BY CASE WHEN ${sortDir} = 'asc' THEN "latestLevel" END ASC,
               CASE WHEN ${sortDir} = 'desc' THEN "latestLevel" END DESC,
               "latestCheckedAt" DESC,
               "latestId" DESC
      LIMIT ${pageSize}
      OFFSET ${offset}
    )
    SELECT snapshots.id,
           snapshots.character_name AS "characterName",
           snapshots.world,
           snapshots.vocation,
           snapshots.level,
           snapshots.rank,
           snapshots.exact_experience AS "exactExperience",
           snapshots.checked_at AS "checkedAt"
    FROM character_highscores_snapshots AS snapshots
    INNER JOIN paged_characters
      ON paged_characters.normalized_name = snapshots.normalized_name
     AND paged_characters.world = snapshots.world
    ORDER BY CASE WHEN ${sortDir} = 'asc' THEN paged_characters."latestLevel" END ASC,
             CASE WHEN ${sortDir} = 'desc' THEN paged_characters."latestLevel" END DESC,
             paged_characters."latestCheckedAt" DESC,
             paged_characters."latestId" DESC,
             snapshots.checked_at DESC,
             snapshots.id DESC
  `) as HighscoresSnapshotRow[];

  const countRows = (await sql`
    SELECT COUNT(*)::text AS total
    FROM (
      SELECT DISTINCT normalized_name, world
      FROM character_highscores_snapshots
      WHERE world = COALESCE(${world}, world)
    ) AS unique_characters
  `) as Array<{ total: string | number }>;

  const worldRows = (await sql`
    SELECT DISTINCT world
    FROM character_highscores_snapshots
    ORDER BY world ASC
  `) as Array<{ world: string }>;

  const totalRaw = countRows[0]?.total ?? 0;
  const total = typeof totalRaw === 'string' ? Number.parseInt(totalRaw, 10) : Number(totalRaw);

  return {
    data: rows.map(mapSnapshotRow),
    total,
    worlds: worldRows.map((row) => row.world),
  };
}
