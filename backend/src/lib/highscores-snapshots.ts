import { query } from '@/lib/db';

interface HighscoresSnapshot {
  characterName: string;
  world: string;
  vocation: string;
  level: number;
  rank: number;
  exactExperience: number;
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
    const result = await query(
      `SELECT last_save_bucket FROM character_highscores_last_save 
       WHERE normalized_name = $1 AND world = $2`,
      [normalizedName.toLowerCase(), world],
    );

    if (!result.rows.length) {
      return true; // Not saved before
    }

    const lastBucket = new Date(result.rows[0].last_save_bucket);
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
    // Insert snapshots
    for (const snapshot of charactersToSave) {
      await query(
        `INSERT INTO character_highscores_snapshots 
         (character_name, normalized_name, world, vocation, level, rank, exact_experience, checked_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          snapshot.characterName,
          snapshot.characterName.toLowerCase(),
          snapshot.world,
          snapshot.vocation,
          snapshot.level,
          snapshot.rank,
          snapshot.exactExperience,
          now,
        ],
      );
    }

    // Update last save buckets
    for (const snapshot of charactersToSave) {
      const normalizedName = snapshot.characterName.toLowerCase();
      await query(
        `INSERT INTO character_highscores_last_save (normalized_name, world, last_save_bucket)
         VALUES ($1, $2, $3)
         ON CONFLICT (normalized_name, world) DO UPDATE 
         SET last_save_bucket = $3`,
        [normalizedName, snapshot.world, currentBucket],
      );
    }
  } catch (error) {
    console.error('[highscores.saveSnapshots] Error saving snapshots:', error);
  }
}
