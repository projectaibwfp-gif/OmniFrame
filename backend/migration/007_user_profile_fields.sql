-- Add profile fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS birth_date DATE;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS description TEXT;

-- Ensure updated_at is managed on every update
-- The column already exists from migration 003, just ensuring it's set correctly
CREATE OR REPLACE FUNCTION update_users_updated_at() RETURNS TRIGGER AS $update_users_updated_at$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END
$update_users_updated_at$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_update_timestamp ON users;

CREATE TRIGGER users_update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();
