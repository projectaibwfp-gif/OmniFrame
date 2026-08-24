import { getSql } from '@/lib/db';

interface HighscoresSnapshot {
  characterName: string;
  world: string;
  vocation: string;
  level: number;
  rank: number;
  exactExperience: number;
}

interface LatestHighscoresSnapshotRow {
  exactExperience: number;
  rank: number;
  vocation: string;
  checkedAt: string;
}

export interface LatestHighscoresSnapshot {
  exactExperience: number;
  rank: number;
  vocation: string;
  checkedAt: string;
}

/**
 * Round timestamp to nearest 15-minute interval
 * 10:00, 10:15, 10:30, 10:45, 11:00, etc.
 */
function roundTo15MinBucket(timestamp: Date): Date {
  const ms = timestamp.getTime();
  const bucketMs = 15 * 60 * 1000; // 15 minutes in ms
  const rounded = Math.floor(ms / bucketMs) * bucketMs;
  return new Date(rounded);
}

/**
 * Check if character should be saved (15-min bucketing)
 */
async function shouldSaveCharacter(normalizedName: string, world: string): Promise<boolean> {
  try {
    const sql = getSql();
    const result = await sql`
      SELECT last_save_bucket FROM character_highscores_last_save 
      WHERE normalized_name = ${normalizedName.toLowerCase()} AND world = ${world}
    `;

    if (!result.length) {
      return true; // Not saved before
    }

    const lastBucket = new Date(result[0].last_save_bucket as string);
    const currentBucket = roundTo15MinBucket(new Date());
    return lastBucket.getTime() !== currentBucket.getTime();
  } catch (error) {
    console.error('[highscores.saveSnapshots] Error checking last save:', error);
    return false;
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
    console.error('[highscores.saveSnapshots] Error saving snapshots:', error);
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
  `) as LatestHighscoresSnapshotRow[];

  if (!rows.length) {
    return null;
  }

  return rows[0];
}
