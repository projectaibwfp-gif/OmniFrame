import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ data: { success: true } }, { status: 200 });
  clearSessionCookie(response);
  return response;
}
