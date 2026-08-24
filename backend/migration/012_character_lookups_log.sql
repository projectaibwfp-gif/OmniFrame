-- Add lookup_log column to character_lookups for debugging
ALTER TABLE character_lookups ADD COLUMN IF NOT EXISTS lookup_log TEXT;
