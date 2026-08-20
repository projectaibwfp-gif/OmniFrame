ALTER TABLE IF EXISTS projects RENAME TO products;

ALTER INDEX IF EXISTS idx_projects_updated_at RENAME TO idx_products_updated_at;
ALTER INDEX IF EXISTS idx_projects_created_by_id RENAME TO idx_products_created_by_id;

DROP TRIGGER IF EXISTS projects_update_timestamp ON products;
DROP FUNCTION IF EXISTS update_projects_updated_at();

CREATE FUNCTION update_products_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS 'BEGIN NEW.updated_at = now(); RETURN NEW; END';
CREATE TRIGGER products_update_timestamp BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_products_updated_at();
