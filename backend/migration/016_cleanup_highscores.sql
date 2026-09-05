-- Remove duplicates: keep only the latest snapshot for each (character, world, exact_experience)
DELETE FROM character_highscores_snapshots
WHERE id NOT IN (
  SELECT DISTINCT ON (normalized_name, world, exact_experience) id
  FROM character_highscores_snapshots
  ORDER BY normalized_name, world, exact_experience, checked_at DESC
);

-- Drop the bucketing table - no longer needed
DROP TABLE IF EXISTS character_highscores_last_save;
