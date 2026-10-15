import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';
import { HttpStatus } from '@/lib/http-status';
import { logInfo } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ data: { success: true } }, { status: HttpStatus.OK });
  clearSessionCookie(response);
  logInfo('auth.logout', 'session cleared');
  return response;
}
