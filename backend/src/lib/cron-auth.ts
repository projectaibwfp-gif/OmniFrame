import { timingSafeEqual } from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from './api-response';
import { ErrorCode } from './errors';
import { HttpStatus } from './http-status';
import { logError, logWarn } from './logger';

const BEARER_PREFIX = 'Bearer ';

function matchesToken(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

/** Returns a 401 response unless the request carries `Authorization: Bearer <CRON_AUTH_TOKEN>`. */
export function denyUnauthorizedCronRequest(request: NextRequest): NextResponse | null {
  const expectedToken = process.env.CRON_AUTH_TOKEN?.trim();
  if (!expectedToken) {
    logError('cron.auth', ErrorCode.AUTH_REQUIRED, { reason: 'CRON_AUTH_TOKEN not set' });
    return errorResponse(
      'Cron is not configured',
      HttpStatus.UNAUTHORIZED,
      ErrorCode.AUTH_REQUIRED,
    );
  }

  const header = request.headers.get('authorization') ?? '';
  const providedToken = header.startsWith(BEARER_PREFIX) ? header.slice(BEARER_PREFIX.length) : '';
  if (!matchesToken(providedToken, expectedToken)) {
    logWarn('cron.auth', ErrorCode.AUTH_REQUIRED, { reason: 'invalid cron token' });
    return errorResponse(
      'Authentication required',
      HttpStatus.UNAUTHORIZED,
      ErrorCode.AUTH_REQUIRED,
    );
  }

  return null;
}
