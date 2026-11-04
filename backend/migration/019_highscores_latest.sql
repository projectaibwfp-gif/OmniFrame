-- Latest highscores entry per character and world. Lets list queries and the
-- cron dedupe skip DISTINCT ON over the whole snapshots history.
CREATE TABLE IF NOT EXISTS character_highscores_latest (
  normalized_name TEXT NOT NULL,
  world TEXT NOT NULL,
  character_name TEXT NOT NULL,
  vocation TEXT NOT NULL,
  level INT NOT NULL,
  rank INT NOT NULL,
  exact_experience BIGINT NOT NULL,
  snapshot_id UUID NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (normalized_name, world)
);

-- character_highscores_snapshots.checked_at is TIMESTAMP stored in UTC.
INSERT INTO character_highscores_latest (
  normalized_name, world, character_name, vocation, level, rank, exact_experience, snapshot_id, checked_at
)
SELECT DISTINCT ON (normalized_name, world)
       normalized_name, world, character_name, vocation, level, rank, exact_experience, id,
       checked_at AT TIME ZONE 'UTC'
FROM character_highscores_snapshots
ORDER BY normalized_name, world, checked_at DESC, id DESC
ON CONFLICT (normalized_name, world) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_character_highscores_latest_world_level
  ON character_highscores_latest (world, level DESC);

CREATE INDEX IF NOT EXISTS idx_character_highscores_latest_level
  ON character_highscores_latest (level DESC);

CREATE INDEX IF NOT EXISTS idx_character_highscores_latest_snapshot_id
  ON character_highscores_latest (snapshot_id);

CREATE INDEX IF NOT EXISTS idx_character_highscores_snapshots_checked_at
  ON character_highscores_snapshots (checked_at);

CREATE INDEX IF NOT EXISTS idx_character_lookups_checked_at
  ON character_lookups (checked_at);
