import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, TibiaCreaturesDto } from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';
import { fetchCreatures } from '@/lib/tibiadata';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  try {
    const data = await fetchCreatures();
    return NextResponse.json<ApiResponse<TibiaCreaturesDto>>({ data });
  } catch (error) {
    logError('creatures.get', ErrorCode.INTERNAL_ERROR, {}, error);
    return errorResponse('Could not load creatures', 502, ErrorCode.INTERNAL_ERROR);
  }
}
