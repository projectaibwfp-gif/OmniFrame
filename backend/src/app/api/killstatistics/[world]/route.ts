import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, TibiaKillStatisticsWorldDto } from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';
import { fetchKillStatistics, TibiaDataNotFoundError } from '@/lib/tibiadata';

export const dynamic = 'force-dynamic';

interface RouteParams {
  world: string;
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
  const world = decodeURIComponent(params.world ?? '').trim();

  if (!world) {
    return errorResponse('World is required', 400, ErrorCode.VALIDATION_FAILED);
  }

  try {
    const data = await fetchKillStatistics(world);
    return NextResponse.json<ApiResponse<TibiaKillStatisticsWorldDto>>({ data });
  } catch (error) {
    if (error instanceof TibiaDataNotFoundError) {
      return errorResponse('Kill statistics not found', 404, ErrorCode.NOT_FOUND);
    }

    logError('killstatistics.get', ErrorCode.INTERNAL_ERROR, { world }, error);
    return errorResponse('Could not load kill statistics', 502, ErrorCode.INTERNAL_ERROR);
  }
}
