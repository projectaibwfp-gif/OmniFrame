-- checked_at was TIMESTAMP holding UTC values; keep the same instants as TIMESTAMPTZ.
ALTER TABLE character_highscores_snapshots
  ALTER COLUMN checked_at TYPE TIMESTAMPTZ USING checked_at AT TIME ZONE 'UTC';

ALTER TABLE character_highscores_snapshots
  ALTER COLUMN checked_at SET DEFAULT now();

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
