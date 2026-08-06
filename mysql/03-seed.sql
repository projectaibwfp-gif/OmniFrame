USE project_ai;

INSERT INTO projects (name, status, category)
SELECT 'Customer insights dashboard', 'active', 'Analytics'
WHERE NOT EXISTS (
  SELECT 1 FROM projects WHERE name = 'Customer insights dashboard'
);

INSERT INTO projects (name, status, category)
SELECT 'Marketing automation', 'active', 'Automation'
WHERE NOT EXISTS (
  SELECT 1 FROM projects WHERE name = 'Marketing automation'
);

INSERT INTO projects (name, status, category)
SELECT 'Internal knowledge base', 'draft', 'Operations'
WHERE NOT EXISTS (
  SELECT 1 FROM projects WHERE name = 'Internal knowledge base'
);

INSERT INTO projects (name, status, category)
SELECT 'AI support assistant', 'active', 'Product'
WHERE NOT EXISTS (
  SELECT 1 FROM projects WHERE name = 'AI support assistant'
);
