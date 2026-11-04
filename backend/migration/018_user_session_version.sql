-- Bumping session_version revokes every refresh token issued for the user.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 0;
