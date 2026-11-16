CREATE TABLE IF NOT EXISTS character_lookup_jobs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  normalized_name   TEXT NOT NULL,
  requested_by_sub  TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts          INTEGER NOT NULL DEFAULT 0,
  result            JSONB,
  error             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at        TIMESTAMPTZ,
  finished_at       TIMESTAMPTZ
);

-- At most one active job per character; repeated requests reuse it instead of queueing duplicates.
CREATE UNIQUE INDEX IF NOT EXISTS uq_character_lookup_jobs_active_name
  ON character_lookup_jobs (normalized_name)
  WHERE status IN ('pending', 'processing');

CREATE INDEX IF NOT EXISTS idx_character_lookup_jobs_status_created_at
  ON character_lookup_jobs (status, created_at);
