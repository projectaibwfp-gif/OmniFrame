-- Add profile fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS birth_date DATE;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS description TEXT;

-- Create or replace function for updating timestamp
DROP TRIGGER IF EXISTS users_update_timestamp ON users;

DROP FUNCTION IF EXISTS update_users_updated_at();

CREATE FUNCTION update_users_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS 'BEGIN NEW.updated_at = now(); RETURN NEW; END';

CREATE TRIGGER users_update_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_users_updated_at();
