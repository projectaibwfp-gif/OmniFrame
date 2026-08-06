-- Seed only when the table is empty (idempotent)
INSERT INTO projects (name, status, category)
SELECT v.name, v.status, v.category
FROM (VALUES
  ('Customer insights dashboard', 'active', 'Analytics'),
  ('Marketing automation', 'active', 'Automation'),
  ('Internal knowledge base', 'draft', 'Operations'),
  ('AI support assistant', 'active', 'Product')
) AS v(name, status, category)
WHERE NOT EXISTS (SELECT 1 FROM projects);
