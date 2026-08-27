ALTER TABLE users
ADD COLUMN IF NOT EXISTS main_character_name VARCHAR(255);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS main_character_world VARCHAR(64);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS main_character_vocation VARCHAR(64);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS main_character_level INTEGER;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS main_character_linked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_main_character_name
  ON users (main_character_name);
