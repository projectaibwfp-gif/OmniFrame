import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, ProductDto, ProductUpdateRequestDto } from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';
import { deleteProduct, getProductById, updateProduct } from '@/lib/products';

export const dynamic = 'force-dynamic';

interface RouteParams {
  id: string;
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<RouteParams> },
): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const params = await props.params;
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return errorResponse('Invalid product ID', 400, ErrorCode.VALIDATION_FAILED);
  }

  try {
    const product = await getProductById(id);
    if (product === null) {
      return errorResponse('Product not found', 404, ErrorCode.NOT_FOUND);
    }

    return NextResponse.json<ApiResponse<ProductDto>>({ data: product });
  } catch (error) {
    logError('products.get', ErrorCode.DB_QUERY_FAILED, { id }, error);
    return errorResponse('Could not load product', 500, ErrorCode.DB_QUERY_FAILED);
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<RouteParams> },
): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const params = await props.params;
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return errorResponse('Invalid product ID', 400, ErrorCode.VALIDATION_FAILED);
  }

  let payload: ProductUpdateRequestDto;

  try {
    payload = (await request.json()) as ProductUpdateRequestDto;
  } catch (error) {
    logError('products.update', ErrorCode.REQUEST_INVALID_JSON, { id }, error);
    return errorResponse('Request body must be valid JSON', 400, ErrorCode.REQUEST_INVALID_JSON);
  }

  const name = payload.name?.trim();
  const category = payload.category?.trim();
  const status = payload.status;
  const description = payload.description?.trim();

  if (name !== undefined && (!name || name.length > 120)) {
    return errorResponse(
      'Name must not be empty and must be no longer than 120 characters',
      400,
      ErrorCode.VALIDATION_FAILED,
    );
  }

  if (status !== undefined && !['active', 'draft'].includes(status)) {
    return errorResponse('Status must be active or draft', 400, ErrorCode.VALIDATION_FAILED);
  }

  if (description !== undefined && description.length > 500) {
    return errorResponse(
      'Description must be no longer than 500 characters',
      400,
      ErrorCode.VALIDATION_FAILED,
    );
  }

  try {
    const product = await updateProduct(id, {
      name,
      category,
      status,
      description,
    });

    if (product === null) {
      return errorResponse('Product not found', 404, ErrorCode.NOT_FOUND);
    }

    return NextResponse.json<ApiResponse<ProductDto>>({ data: product });
  } catch (error) {
    logError('products.update', ErrorCode.DB_QUERY_FAILED, { id }, error);
    return errorResponse('Could not update product', 500, ErrorCode.DB_QUERY_FAILED);
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<RouteParams> },
): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const params = await props.params;
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return errorResponse('Invalid product ID', 400, ErrorCode.VALIDATION_FAILED);
  }

  try {
    const deleted = await deleteProduct(id);
    if (!deleted) {
      return errorResponse('Product not found', 404, ErrorCode.NOT_FOUND);
    }

    return NextResponse.json({ data: { id } });
  } catch (error) {
    logError('products.delete', ErrorCode.DB_QUERY_FAILED, { id }, error);
    return errorResponse('Could not delete product', 500, ErrorCode.DB_QUERY_FAILED);
  }
}
