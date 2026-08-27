DROP TRIGGER IF EXISTS products_update_timestamp ON products;
DROP FUNCTION IF EXISTS update_products_updated_at();
DROP INDEX IF EXISTS idx_products_updated_at;
DROP INDEX IF EXISTS idx_products_created_by_id;
DROP TABLE IF EXISTS products;
