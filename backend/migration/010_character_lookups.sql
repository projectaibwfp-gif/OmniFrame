CREATE TABLE IF NOT EXISTS character_lookups (
  id                    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  requested_name        VARCHAR(255) NOT NULL,
  normalized_name       VARCHAR(255) NOT NULL,
  world                 VARCHAR(64),
  vocation              VARCHAR(64),
  level                 INTEGER,
  experience_status     VARCHAR(32),
  exact_experience      BIGINT,
  experience_rank       INTEGER,
  requested_by_sub      VARCHAR(255),
  checked_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_character_lookups_normalized_name_checked_at
  ON character_lookups (normalized_name, checked_at DESC);
