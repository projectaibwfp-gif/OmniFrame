import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, ProductCreateRequestDto, ProductDto } from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth, loadCurrentUser } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';
import { createProduct, listProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  try {
   const products = await listProducts();

   return NextResponse.json<ApiResponse<ProductDto[]>>({ data: products });
  } catch (error) {
    logError('products.list', ErrorCode.DB_QUERY_FAILED, {}, error);
    return errorResponse('Could not load products', 500, ErrorCode.DB_QUERY_FAILED);
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

  let payload: ProductCreateRequestDto;

  try {
    payload = (await request.json()) as ProductCreateRequestDto;
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
    const result = await createProduct({
      userId: user.id,
      createdByName,
      payload: {
        name,
        status,
        category,
        description,
      },
    });

    return NextResponse.json<ApiResponse<ProductDto>>({ data: result }, { status: 201 });
  } catch (error) {
    logError('products.create', ErrorCode.DB_QUERY_FAILED, { name }, error);
    return errorResponse('Could not create product', 500, ErrorCode.DB_QUERY_FAILED);
  }
}
