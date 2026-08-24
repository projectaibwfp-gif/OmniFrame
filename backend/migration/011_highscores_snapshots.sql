-- Store highscores snapshots for all characters
CREATE TABLE IF NOT EXISTS character_highscores_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL, -- lowercase for searching
  world TEXT NOT NULL,
  vocation TEXT NOT NULL, -- from highscores
  level INT NOT NULL,
  rank INT NOT NULL, -- position in highscores
  exact_experience BIGINT NOT NULL,
  checked_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_character_highscores_snapshots_normalized_name_world_checked_at
ON character_highscores_snapshots(normalized_name, world, checked_at DESC);

-- Track last save time per character (15-min bucketing)
CREATE TABLE IF NOT EXISTS character_highscores_last_save (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  normalized_name TEXT NOT NULL,
  world TEXT NOT NULL,
  last_save_bucket TIMESTAMP NOT NULL, -- rounded to nearest 15-min interval
  UNIQUE(normalized_name, world)
);
