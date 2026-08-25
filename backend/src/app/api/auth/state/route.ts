import { NextResponse } from 'next/server';
import type { ApiResponse, AuthStateDto } from '@shared/api-contract';
import { createLoginState, storeLoginState } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const state = createLoginState();
  const response = NextResponse.json<ApiResponse<AuthStateDto>>(
    { data: { state } },
    { status: 200 },
  );
  storeLoginState(response, state);
  return response;
}
