import { NextResponse } from 'next/server';
import type { ApiResponse, AuthStateDto } from '@shared/api-contract';
import { createLoginState, storeLoginState } from '@/lib/auth';
import { HttpStatus } from '@/lib/http-status';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const state = createLoginState();
  const response = NextResponse.json<ApiResponse<AuthStateDto>>(
    { data: { state } },
    { status: HttpStatus.OK },
  );
  storeLoginState(response, state);
  return response;
}
