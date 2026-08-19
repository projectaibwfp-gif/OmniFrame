import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth, loadCurrentUser } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';

interface ProductRow {
  id: number;
  name: string;
  status: 'active' | 'draft';
  category: string;
  description?: string;
  created_by_id?: number;
  created_by_name?: string;
  createdAt?: string;
  updatedAt: string;
}

interface ProductPayload {
  name?: string;
  status?: 'active' | 'draft';
  category?: string;
  description?: string;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  try {
    const products = (await getSql()`
      SELECT id, name, status, category, description,
             created_by_id, created_by_name,
             to_char(created_at, 'YYYY-MM-DD') AS "createdAt",
             to_char(updated_at, 'YYYY-MM-DD') AS "updatedAt"
      FROM projects
      ORDER BY updated_at DESC
      LIMIT 20
    `) as ProductRow[];

    return NextResponse.json({ data: products });
  } catch (error) {
    logError('products.list', ErrorCode.DB_QUERY_FAILED, {}, error);
    return errorResponse('Could not load projects', 500, ErrorCode.DB_QUERY_FAILED);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const user = await loadCurrentUser(request);
  if (user instanceof NextResponse) {
    return user;
  }

  let payload: ProductPayload;

  try {
    payload = (await request.json()) as ProductPayload;
  } catch (error) {
    logError('products.create', ErrorCode.REQUEST_INVALID_JSON, {}, error);
    return errorResponse('Request body must be valid JSON', 400, ErrorCode.REQUEST_INVALID_JSON);
  }

  const name = payload.name?.trim();
  const category = payload.category?.trim() || 'General';
  const status = payload.status ?? 'draft';
  const description = payload.description?.trim() || null;
  const createdByName = user.name || user.email || 'SYSTEM';

  if (!name || name.length > 120) {
    return errorResponse(
      'Name is required and must be no longer than 120 characters',
      400,
      ErrorCode.VALIDATION_FAILED,
    );
  }

  if (!['active', 'draft'].includes(status)) {
    return errorResponse('Status must be active or draft', 400, ErrorCode.VALIDATION_FAILED);
  }

  if (description !== null && description.length > 500) {
    return errorResponse(
      'Description must be no longer than 500 characters',
      400,
      ErrorCode.VALIDATION_FAILED,
    );
  }

  try {
    const result = (await getSql()`
      INSERT INTO projects (name, status, category, description, created_by_id, created_by_name)
      VALUES (${name}, ${status}, ${category}, ${description}, ${user.id}, ${createdByName})
      RETURNING id, name, status, category, description, created_by_id, created_by_name,
                to_char(created_at, 'YYYY-MM-DD') AS "createdAt",
                to_char(updated_at, 'YYYY-MM-DD') AS "updatedAt"
    `) as ProductRow[];

    return NextResponse.json(
      { data: result[0] },
      { status: 201 },
    );
  } catch (error) {
    logError('products.create', ErrorCode.DB_QUERY_FAILED, { name }, error);
    return errorResponse('Could not create project', 500, ErrorCode.DB_QUERY_FAILED);
  }
}
