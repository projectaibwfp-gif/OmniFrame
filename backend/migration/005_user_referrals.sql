ALTER TABLE users
  ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(255);

CREATE TABLE IF NOT EXISTS user_referral_attributions (
  id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        INTEGER      NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  referral_code  VARCHAR(255) NOT NULL,
  assigned_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_referral_attributions_referral_code
  ON user_referral_attributions (referral_code);
