-- Add fields to projects table (products)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS created_by_id INTEGER REFERENCES users(id);

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(255);

-- Ensure updated_at is managed on every update
CREATE OR REPLACE FUNCTION update_projects_updated_at() RETURNS TRIGGER AS $update_projects_updated_at$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END
$update_projects_updated_at$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_update_timestamp ON projects;

CREATE TRIGGER projects_update_timestamp
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_projects_updated_at();

CREATE INDEX IF NOT EXISTS idx_projects_created_by_id ON projects (created_by_id);
