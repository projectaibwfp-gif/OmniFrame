-- Store full character payload for each lookup
ALTER TABLE character_lookups
  ADD COLUMN IF NOT EXISTS character_snapshot JSONB;
