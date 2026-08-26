import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, TibiaNewsListDto } from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';
import { fetchNews } from '@/lib/tibiadata';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  try {
    const data = await fetchNews();
    return NextResponse.json<ApiResponse<TibiaNewsListDto>>({ data });
  } catch (error) {
    logError('news.get', ErrorCode.INTERNAL_ERROR, {}, error);
    return errorResponse('Could not load Tibia news', 502, ErrorCode.INTERNAL_ERROR);
  }
}
