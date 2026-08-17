import { NextResponse } from 'next/server';
import { createLoginState, storeLoginState } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const state = createLoginState();
  const response = NextResponse.json({ data: { state } }, { status: 200 });
  storeLoginState(response, state);
  return response;
}
