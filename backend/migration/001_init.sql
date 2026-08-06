CREATE TABLE IF NOT EXISTS projects (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft')),
  category VARCHAR(80) NOT NULL DEFAULT 'General',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects (updated_at DESC);
