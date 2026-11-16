-- Remove duplicates left by concurrent cron runs before adding the unique index.
-- The snapshot referenced by character_highscores_latest always survives.
WITH ranked_snapshots AS (
  SELECT snapshots.id,
         ROW_NUMBER() OVER (
           PARTITION BY snapshots.normalized_name, snapshots.world, snapshots.exact_experience
           ORDER BY (latest.snapshot_id IS NOT NULL) DESC, snapshots.checked_at DESC, snapshots.id DESC
         ) AS position
  FROM character_highscores_snapshots AS snapshots
  LEFT JOIN character_highscores_latest AS latest
    ON latest.snapshot_id = snapshots.id
)
DELETE FROM character_highscores_snapshots
WHERE id IN (SELECT id FROM ranked_snapshots WHERE position > 1);

CREATE UNIQUE INDEX IF NOT EXISTS uq_character_highscores_snapshots_experience
  ON character_highscores_snapshots (normalized_name, world, exact_experience);

-- One experience value per character, world and calendar month (UTC) for history
-- older than the detailed retention window. recorded_at keeps the newest value
-- when a month is rolled up over several cron runs.
CREATE TABLE IF NOT EXISTS character_highscores_monthly (
  normalized_name TEXT NOT NULL,
  world TEXT NOT NULL,
  month DATE NOT NULL,
  character_name TEXT NOT NULL,
  exact_experience BIGINT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (normalized_name, world, month)
);
