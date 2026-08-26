import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, BoostableBossesDto } from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';
import { fetchBoostableBosses } from '@/lib/tibiadata';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  try {
    const data = await fetchBoostableBosses();
    return NextResponse.json<ApiResponse<BoostableBossesDto>>({ data });
  } catch (error) {
    logError('boostable-bosses.get', ErrorCode.INTERNAL_ERROR, {}, error);
    return errorResponse('Could not load boostable bosses', 502, ErrorCode.INTERNAL_ERROR);
  }
}
