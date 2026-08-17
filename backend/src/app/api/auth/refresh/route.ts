import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-response';
import { clearSessionCookie, refreshSessionCookie } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.json({ data: { refreshed: true } }, { status: 200 });

  try {
    await refreshSessionCookie(request, response);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not refresh session';
    logError('auth.refresh', ErrorCode.AUTH_REFRESH_FAILED, { reason: message }, error);
    const denied = errorResponse('Authentication required', 401, ErrorCode.AUTH_REFRESH_FAILED);
    clearSessionCookie(denied);
    return denied;
  }
}
