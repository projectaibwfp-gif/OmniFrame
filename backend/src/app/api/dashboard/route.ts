import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, DashboardDto } from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';
import { getDashboardMetrics } from '@/lib/dashboard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  try {
    const metrics = await getDashboardMetrics();
    return NextResponse.json<ApiResponse<DashboardDto>>({ data: metrics });
  } catch (error) {
    logError('dashboard', ErrorCode.DB_QUERY_FAILED, {}, error);
    return errorResponse('Could not load dashboard metrics', 500, ErrorCode.DB_QUERY_FAILED);
  }
}
