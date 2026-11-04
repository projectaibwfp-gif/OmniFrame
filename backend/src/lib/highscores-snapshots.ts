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

function dedupeByCharacter(snapshots: HighscoresSnapshot[]): HighscoresSnapshot[] {
  const byCharacter = new Map<string, HighscoresSnapshot>();
  for (const snapshot of snapshots) {
    const key = `${snapshot.characterName.toLowerCase()}|${snapshot.world}`;
    if (!byCharacter.has(key)) {
      byCharacter.set(key, snapshot);
    }
  }
  return [...byCharacter.values()];
}

/**
 * Persists highscores entries in one statement. An entry is stored only when it
 * is the first one for that character on that world or when its exact experience
 * differs from `character_highscores_latest`; unchanged entries are skipped.
 * The same statement moves `character_highscores_latest` to the new snapshot.
 */
export async function saveHighscoresSnapshots(snapshots: HighscoresSnapshot[]): Promise<void> {
  const entries = dedupeByCharacter(snapshots);
  if (!entries.length) {
    return;
  }

  const now = new Date();

  try {
    const sql = getSql();
    await sql`
      WITH input AS (
        SELECT *
        FROM unnest(
          ${entries.map((entry) => entry.characterName)}::text[],
          ${entries.map((entry) => entry.characterName.toLowerCase())}::text[],
          ${entries.map((entry) => entry.world)}::text[],
          ${entries.map((entry) => entry.vocation)}::text[],
          ${entries.map((entry) => entry.level)}::int[],
          ${entries.map((entry) => entry.rank)}::int[],
          ${entries.map((entry) => entry.exactExperience)}::bigint[]
        ) AS entry(character_name, normalized_name, world, vocation, level, rank, exact_experience)
      ),
      changed AS (
        SELECT input.*
        FROM input
        LEFT JOIN character_highscores_latest AS latest
          ON latest.normalized_name = input.normalized_name
         AND latest.world = input.world
        WHERE latest.exact_experience IS DISTINCT FROM input.exact_experience
      ),
      inserted AS (
        INSERT INTO character_highscores_snapshots
        (character_name, normalized_name, world, vocation, level, rank, exact_experience, checked_at)
        SELECT character_name, normalized_name, world, vocation, level, rank, exact_experience, ${now}
        FROM changed
        RETURNING id, character_name, normalized_name, world, vocation, level, rank, exact_experience
      )
      INSERT INTO character_highscores_latest
      (normalized_name, world, character_name, vocation, level, rank, exact_experience, snapshot_id, checked_at)
      SELECT normalized_name, world, character_name, vocation, level, rank, exact_experience, id, ${now}
      FROM inserted
      ON CONFLICT (normalized_name, world) DO UPDATE
      SET character_name = EXCLUDED.character_name,
          vocation = EXCLUDED.vocation,
          level = EXCLUDED.level,
          rank = EXCLUDED.rank,
          exact_experience = EXCLUDED.exact_experience,
          snapshot_id = EXCLUDED.snapshot_id,
          checked_at = EXCLUDED.checked_at
    `;
  } catch (error) {
    logError(
      'highscores.saveSnapshots',
      ErrorCode.DB_QUERY_FAILED,
      { reason: 'Error saving snapshots', count: entries.length },
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
 * Pages characters (one row of `character_highscores_latest` per character and
 * world) ordered by their latest level, and returns every stored snapshot of the
 * characters on that page.
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
    WITH paged_characters AS (
      SELECT normalized_name,
             world,
             snapshot_id AS "latestId",
             level AS "latestLevel",
             checked_at AS "latestCheckedAt"
      FROM character_highscores_latest
      WHERE ${world}::text IS NULL OR world = ${world}
      ORDER BY CASE WHEN ${sortDir} = 'asc' THEN level END ASC,
               CASE WHEN ${sortDir} = 'desc' THEN level END DESC,
               checked_at DESC,
               snapshot_id DESC
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
    FROM character_highscores_latest
    WHERE ${world}::text IS NULL OR world = ${world}
  `) as Array<{ total: string | number }>;

  const worldRows = (await sql`
    SELECT DISTINCT world
    FROM character_highscores_latest
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
