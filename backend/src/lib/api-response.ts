import { NextResponse } from 'next/server';
import type { ApiErrorResponseDto } from '@shared/api-contract';
import { ErrorCode } from './errors';
import { HttpStatus } from './http-status';

/** Outcome of a route step: either a value to continue with or a ready error response. */
export type RouteResult<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

export function errorResponse(
  message: string,
  status: number = HttpStatus.INTERNAL_SERVER_ERROR,
  code: ErrorCode = ErrorCode.INTERNAL_ERROR,
): NextResponse<ApiErrorResponseDto> {
  return NextResponse.json<ApiErrorResponseDto>({ error: { code, message } }, { status });
}
