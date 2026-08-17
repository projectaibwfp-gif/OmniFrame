import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';

interface ProductRow {
  id: number;
  name: string;
  status: 'active' | 'draft';
  category: string;
  updatedAt: string;
}

interface ProductPayload {
  name?: string;
  status?: 'active' | 'draft';
  category?: string;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  try {
    const products = (await getSql()`
      SELECT id, name, status, category,
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

  try {
    const result = (await getSql()`
      INSERT INTO projects (name, status, category)
      VALUES (${name}, ${status}, ${category})
      RETURNING id
    `) as { id: number }[];

    return NextResponse.json(
      { data: { id: result[0]?.id, name, status, category } },
      { status: 201 },
    );
  } catch (error) {
    logError('products.create', ErrorCode.DB_QUERY_FAILED, { name }, error);
    return errorResponse('Could not create project', 500, ErrorCode.DB_QUERY_FAILED);
  }
}
