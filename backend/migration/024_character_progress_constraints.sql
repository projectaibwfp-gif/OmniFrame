-- Progress entries of deleted users cannot be reached anymore; remove them before adding the FK.
DELETE FROM character_progress_entries AS progress
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE users.google_id = progress.google_id
);

ALTER TABLE character_progress_entries
  ADD CONSTRAINT fk_character_progress_entries_user
  FOREIGN KEY (google_id) REFERENCES users (google_id) ON DELETE CASCADE;

ALTER TABLE character_progress_entries
  ADD CONSTRAINT chk_character_progress_entries_target_kind
  CHECK (target_kind IN ('boss', 'creature'));

ALTER TABLE character_progress_entries
  ADD CONSTRAINT chk_character_progress_entries_status
  CHECK (status IN ('first-time', 'completed'));
