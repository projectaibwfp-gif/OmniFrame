-- Remove all snapshots with no EXP (unavailable status)
DELETE FROM character_highscores_snapshots
WHERE exact_experience IS NULL OR exact_experience = 0;

-- Remove duplicates: keep only the latest snapshot for each (character, world, exact_experience)
WITH ranked_snapshots AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY normalized_name, world, exact_experience ORDER BY checked_at DESC) as rn
  FROM character_highscores_snapshots
)
DELETE FROM character_highscores_snapshots
WHERE id IN (
  SELECT id FROM ranked_snapshots WHERE rn > 1
);

-- Drop the bucketing table - no longer needed
DROP TABLE IF EXISTS character_highscores_last_save;

