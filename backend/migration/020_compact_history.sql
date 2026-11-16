-- migrate:no-transaction
-- One-off compaction: the Neon project is over its storage limit, so nothing can
-- allocate a new file until space is freed. Every statement commits on its own and
-- can be repeated if the build fails halfway. Ongoing retention (30 days + monthly
-- totals) is done by the cron.

-- Characters missing from the highscores for 14 days.
DELETE FROM character_highscores_latest
WHERE checked_at < now() - INTERVAL '14 days';

DELETE FROM character_highscores_snapshots AS snapshots
WHERE snapshots.checked_at < (now() AT TIME ZONE 'UTC') - INTERVAL '14 days'
  AND NOT EXISTS (
    SELECT 1
    FROM character_highscores_latest AS latest
    WHERE latest.snapshot_id = snapshots.id
  );

-- The newest lookup of every character stays as the fallback when TibiaData is down.
DELETE FROM character_lookups AS lookups
WHERE lookups.checked_at < now() - INTERVAL '14 days'
  AND EXISTS (
    SELECT 1
    FROM character_lookups AS newer
    WHERE newer.normalized_name = lookups.normalized_name
      AND newer.checked_at > lookups.checked_at
  );

-- DELETE only marks rows dead. Dropping the secondary indexes frees space at once,
-- which VACUUM FULL needs to write the compacted copies of the tables.
DROP INDEX IF EXISTS idx_character_highscores_snapshots_normalized_name_world_checked_at;
DROP INDEX IF EXISTS idx_character_highscores_snapshots_checked_at;
DROP INDEX IF EXISTS idx_character_lookups_normalized_name_checked_at;
DROP INDEX IF EXISTS idx_character_lookups_checked_at;

VACUUM FULL character_highscores_snapshots;
VACUUM FULL character_highscores_latest;
VACUUM FULL character_lookups;

CREATE INDEX IF NOT EXISTS idx_character_highscores_snapshots_normalized_name_world_checked_at
  ON character_highscores_snapshots (normalized_name, world, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_character_highscores_snapshots_checked_at
  ON character_highscores_snapshots (checked_at);

CREATE INDEX IF NOT EXISTS idx_character_lookups_normalized_name_checked_at
  ON character_lookups (normalized_name, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_character_lookups_checked_at
  ON character_lookups (checked_at);
