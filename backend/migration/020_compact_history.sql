-- One-off compaction: the Neon project hit its storage limit, so history older
-- than 14 days is dropped. Ongoing retention (30 days + monthly totals) is done by the cron.

-- checked_at was TIMESTAMP holding UTC values. With the session time zone set to
-- UTC, PostgreSQL converts TIMESTAMP to TIMESTAMPTZ without rewriting the table.
SET LOCAL TIME ZONE 'UTC';

ALTER TABLE character_highscores_snapshots
  ALTER COLUMN checked_at TYPE TIMESTAMPTZ;

ALTER TABLE character_highscores_snapshots
  ALTER COLUMN checked_at SET DEFAULT now();

-- Characters missing from the highscores for 14 days.
DELETE FROM character_highscores_latest
WHERE checked_at < now() - INTERVAL '14 days';

DELETE FROM character_highscores_snapshots AS snapshots
WHERE snapshots.checked_at < now() - INTERVAL '14 days'
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
