import { NextResponse, type NextRequest } from 'next/server';
import { errorResponse } from './api-response';
import { isAuthDenied, requireAuth } from './auth';
import { ErrorCode } from './errors';
import { logError } from './logger';
import { TibiaDataNotFoundError } from './tibiadata';

export async function authorizeTibiaRequest(request: NextRequest): Promise<NextResponse | null> {
  const auth = await requireAuth(request);
  return isAuthDenied(auth) ? auth.response : null;
}

export function tibiaDataErrorResponse(
  error: unknown,
  scope: string,
  message: string,
  context: Record<string, unknown>,
): NextResponse {
  if (error instanceof TibiaDataNotFoundError) {
    return errorResponse(`${message} not found`, 404, ErrorCode.NOT_FOUND);
  }

  logError(scope, ErrorCode.INTERNAL_ERROR, context, error);
  return errorResponse(`Could not load ${message.toLowerCase()}`, 502, ErrorCode.INTERNAL_ERROR);
}
