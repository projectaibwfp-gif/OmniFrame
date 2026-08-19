-- Add fields to projects table (products)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS created_by_id INTEGER REFERENCES users(id);

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(255);

-- Create or replace function for updating timestamp
DROP TRIGGER IF EXISTS projects_update_timestamp ON projects;

DROP FUNCTION IF EXISTS update_projects_updated_at();

CREATE FUNCTION update_projects_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS 'BEGIN NEW.updated_at = now(); RETURN NEW; END';

CREATE TRIGGER projects_update_timestamp BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_projects_updated_at();

CREATE INDEX IF NOT EXISTS idx_projects_created_by_id ON projects (created_by_id);
