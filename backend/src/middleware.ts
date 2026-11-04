import { NextResponse, type NextRequest } from 'next/server';
import { errorResponse } from './lib/api-response';
import { isProd } from './lib/cookie-config';
import { ErrorCode } from './lib/errors';
import { HttpStatus } from './lib/http-status';
import { logInfo, logWarn } from './lib/logger';

const PROD_ALLOWED_ORIGIN = 'https://omniframe.vercel.app';
const DEV_ALLOWED_ORIGIN = 'http://localhost:4200';
const PREFLIGHT_MAX_AGE_SECONDS = 86400;
const PREFLIGHT_METHOD = 'OPTIONS';
const CORS_ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', PREFLIGHT_METHOD];
const CORS_ALLOWED_HEADERS = ['Content-Type', 'Authorization'];
const CORS_LIST_SEPARATOR = ',';

const allowedOrigin = isProd ? PROD_ALLOWED_ORIGIN : DEV_ALLOWED_ORIGIN;
const SAFE_METHODS: ReadonlySet<string> = new Set(['GET', 'HEAD', PREFLIGHT_METHOD]);
// The dev origin stays trusted in production because the Vite dev proxy forwards
// localhost:4200 requests (with their Origin header) to the production API.
const CSRF_TRUSTED_ORIGINS: readonly string[] = [PROD_ALLOWED_ORIGIN, DEV_ALLOWED_ORIGIN];

/**
 * Session cookies are SameSite=None (cross-site frontend), so browsers attach them
 * to requests from any site. Mutations are accepted only from trusted origins.
 * Requests without Origin come from non-browser clients (cron, curl), which do
 * not receive the browser's cookies.
 */
function isUntrustedMutation(request: NextRequest, requestOrigin: string | null): boolean {
  if (SAFE_METHODS.has(request.method) || !requestOrigin) {
    return false;
  }
  return requestOrigin !== request.nextUrl.origin && !CSRF_TRUSTED_ORIGINS.includes(requestOrigin);
}

function applyCorsHeaders(response: NextResponse, requestOrigin: string | null): NextResponse {
  // With credentials, the origin must be the specific requesting origin (never `*`).
  if (requestOrigin === allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Vary', 'Origin');
  } else if (requestOrigin) {
    logWarn('cors', ErrorCode.CORS_ORIGIN_NOT_ALLOWED, {
      reason: 'origin not allowed',
      origin: requestOrigin,
    });
  }
  return response;
}

export function middleware(request: NextRequest): NextResponse {
  const requestOrigin = request.headers.get('origin');

  if (request.method === PREFLIGHT_METHOD) {
    const response = new NextResponse(null, { status: HttpStatus.NO_CONTENT });
    applyCorsHeaders(response, requestOrigin);
    response.headers.set(
      'Access-Control-Allow-Methods',
      CORS_ALLOWED_METHODS.join(CORS_LIST_SEPARATOR),
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      CORS_ALLOWED_HEADERS.join(CORS_LIST_SEPARATOR),
    );
    response.headers.set('Access-Control-Max-Age', String(PREFLIGHT_MAX_AGE_SECONDS));
    logInfo('cors', 'preflight', {
      method: PREFLIGHT_METHOD,
      origin: requestOrigin,
      allowed: requestOrigin === allowedOrigin,
    });
    return response;
  }

  if (isUntrustedMutation(request, requestOrigin)) {
    logWarn('csrf', ErrorCode.CSRF_ORIGIN_NOT_ALLOWED, {
      method: request.method,
      origin: requestOrigin,
    });
    return errorResponse(
      'Request origin is not allowed',
      HttpStatus.FORBIDDEN,
      ErrorCode.CSRF_ORIGIN_NOT_ALLOWED,
    );
  }

  return applyCorsHeaders(NextResponse.next(), requestOrigin);
}

export const config = {
  matcher: '/api/:path*',
};
