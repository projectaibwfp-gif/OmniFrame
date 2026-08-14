CREATE TABLE IF NOT EXISTS users (
  id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  google_id       VARCHAR(128) NOT NULL UNIQUE,
  email           VARCHAR(320) NOT NULL UNIQUE,
  email_verified  BOOLEAN      NOT NULL DEFAULT false,
  name            VARCHAR(255),
  given_name      VARCHAR(128),
  family_name     VARCHAR(128),
  picture         TEXT,
  locale          VARCHAR(16),
  last_login_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_google_id ON users (google_id);
CREATE INDEX IF NOT EXISTS idx_users_email     ON users (email);
