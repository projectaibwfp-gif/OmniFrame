CREATE TABLE IF NOT EXISTS character_progress_entries (
  id BIGSERIAL PRIMARY KEY,
  google_id VARCHAR(255) NOT NULL,
  character_name VARCHAR(255) NOT NULL,
  normalized_character_name VARCHAR(255) NOT NULL,
  target_kind VARCHAR(16) NOT NULL,
  target_name VARCHAR(255) NOT NULL,
  normalized_target_name VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_character_progress_unique
  ON character_progress_entries (google_id, normalized_character_name, target_kind, normalized_target_name);

CREATE INDEX IF NOT EXISTS idx_character_progress_character
  ON character_progress_entries (google_id, normalized_character_name);
