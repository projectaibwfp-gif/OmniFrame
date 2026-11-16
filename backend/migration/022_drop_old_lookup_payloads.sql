-- Only the newest lookup of a character keeps its full JSON payload (TibiaData
-- fallback and TTL cache); older lookups keep just the summary columns.
UPDATE character_lookups AS lookups
SET character_snapshot = NULL,
    lookup_log = NULL
WHERE (lookups.character_snapshot IS NOT NULL OR lookups.lookup_log IS NOT NULL)
  AND EXISTS (
    SELECT 1
    FROM character_lookups AS newer
    WHERE newer.normalized_name = lookups.normalized_name
      AND newer.checked_at > lookups.checked_at
  );
