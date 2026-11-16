-- checked_at was TIMESTAMP holding UTC values. With the session time zone set to
-- UTC, PostgreSQL converts TIMESTAMP to TIMESTAMPTZ without rewriting the table.
SET LOCAL TIME ZONE 'UTC';

ALTER TABLE character_highscores_snapshots
  ALTER COLUMN checked_at TYPE TIMESTAMPTZ;

ALTER TABLE character_highscores_snapshots
  ALTER COLUMN checked_at SET DEFAULT now();
