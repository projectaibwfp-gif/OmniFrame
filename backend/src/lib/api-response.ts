import { NextResponse } from 'next/server';
import { ErrorCode } from './errors';

const HTTP_INTERNAL_SERVER_ERROR = 500;

export function errorResponse(
  message: string,
  status = HTTP_INTERNAL_SERVER_ERROR,
  code: ErrorCode = ErrorCode.INTERNAL_ERROR,
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}
