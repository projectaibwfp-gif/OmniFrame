import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-response';
import { clearSessionCookie, refreshSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.json({ data: { refreshed: true } }, { status: 200 });

  try {
    await refreshSessionCookie(request, response);
    return response;
  } catch (error) {
    console.error('Could not refresh session', error);
    const denied = errorResponse('Authentication required', 401);
    clearSessionCookie(denied);
    return denied;
  }
}
