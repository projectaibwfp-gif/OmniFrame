import { NextResponse } from 'next/server';
import { ErrorCode } from './errors';

export function errorResponse(
  message: string,
  status = 500,
  code: ErrorCode = ErrorCode.INTERNAL_ERROR,
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}
