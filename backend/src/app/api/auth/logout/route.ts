import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';
import { logInfo } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ data: { success: true } }, { status: 200 });
  clearSessionCookie(response);
  logInfo('auth.logout', 'session cleared');
  return response;
}
