import type {
  ProductCreateRequestDto,
  ProductDto,
  ProductUpdateRequestDto,
} from '@shared/api-contract';
import { getSql } from './db';

interface ProductRow {
  id: number;
  name: string;
  status: ProductDto['status'];
  category: string;
  description: string | null;
  createdById: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateProductInput {
  userId: number;
  createdByName: string;
  payload: ProductCreateRequestDto;
}

function mapProductRow(row: ProductRow): ProductDto {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    category: row.category,
    description: row.description,
    createdById: row.createdById,
    createdByName: row.createdByName,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listProducts(limit = 20): Promise<ProductDto[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, name, status, category, description,
         created_by_id AS "createdById", created_by_name AS "createdByName",
         to_char(created_at, 'YYYY-MM-DD') AS "createdAt",
         to_char(updated_at, 'YYYY-MM-DD') AS "updatedAt"
    FROM products
    ORDER BY updated_at DESC
    LIMIT ${limit}
  `) as ProductRow[];

  return rows.map(mapProductRow);
}

export async function getProductById(id: number): Promise<ProductDto | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, name, status, category, description,
           created_by_id AS "createdById", created_by_name AS "createdByName",
           to_char(created_at, 'YYYY-MM-DD') AS "createdAt",
           to_char(updated_at, 'YYYY-MM-DD') AS "updatedAt"
    FROM products
    WHERE id = ${id}
    LIMIT 1
  `) as ProductRow[];

  return rows.length > 0 ? mapProductRow(rows[0]) : null;
}

export async function createProduct(input: CreateProductInput): Promise<ProductDto> {
  const name = input.payload.name.trim();
  const category = input.payload.category.trim();
  const status = input.payload.status;
  const description = input.payload.description?.trim() || null;

  const sql = getSql();
  const rows = (await sql`
    INSERT INTO products (name, status, category, description, created_by_id, created_by_name)
    VALUES (${name}, ${status}, ${category}, ${description}, ${input.userId}, ${input.createdByName})
    RETURNING id, name, status, category, description,
              created_by_id AS "createdById",
              created_by_name AS "createdByName",
              to_char(created_at, 'YYYY-MM-DD') AS "createdAt",
              to_char(updated_at, 'YYYY-MM-DD') AS "updatedAt"
  `) as ProductRow[];

  return mapProductRow(rows[0]);
}

export async function updateProduct(
  id: number,
  payload: ProductUpdateRequestDto,
): Promise<ProductDto | null> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE products
    SET name = COALESCE(${payload.name?.trim() || null}, name),
        status = COALESCE(${payload.status || null}, status),
        category = COALESCE(${payload.category?.trim() || null}, category),
        description = ${payload.description === undefined ? null : payload.description?.trim() || null},
        updated_at = now()
    WHERE id = ${id}
    RETURNING id, name, status, category, description,
              created_by_id AS "createdById",
              created_by_name AS "createdByName",
              to_char(created_at, 'YYYY-MM-DD') AS "createdAt",
              to_char(updated_at, 'YYYY-MM-DD') AS "updatedAt"
  `) as ProductRow[];

  return rows.length > 0 ? mapProductRow(rows[0]) : null;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const sql = getSql();
  const result = await sql`
    DELETE FROM products
    WHERE id = ${id}
    RETURNING id
  `;

  return result.length > 0;
}
