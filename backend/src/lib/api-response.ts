import { NextResponse } from 'next/server';
import type { ApiErrorResponseDto } from '@shared/api-contract';
import { ErrorCode } from './errors';

const HTTP_INTERNAL_SERVER_ERROR = 500;

export function errorResponse(
  message: string,
  status = HTTP_INTERNAL_SERVER_ERROR,
  code: ErrorCode = ErrorCode.INTERNAL_ERROR,
): NextResponse<ApiErrorResponseDto> {
  return NextResponse.json<ApiErrorResponseDto>({ error: { code, message } }, { status });
}
