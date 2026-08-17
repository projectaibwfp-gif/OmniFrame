import { NextRequest, NextResponse } from 'next/server';
import { ErrorCode } from './lib/errors';
import { logInfo, logWarn } from './lib/logger';

const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
const allowedOrigin = isProd ? 'https://omniframe.vercel.app' : 'http://localhost:4200';

function applyCorsHeaders(response: NextResponse, requestOrigin: string | null): NextResponse {
  // With credentials, the origin must be the specific requesting origin (never `*`).
  if (requestOrigin === allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Vary', 'Origin');
  } else if (requestOrigin) {
    logWarn('cors', ErrorCode.INTERNAL_ERROR, {
      reason: 'origin not allowed',
      origin: requestOrigin,
    });
  }
  return response;
}

export function middleware(request: NextRequest): NextResponse {
  const requestOrigin = request.headers.get('origin');

  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    applyCorsHeaders(response, requestOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
    logInfo('cors', 'preflight', {
      method: 'OPTIONS',
      origin: requestOrigin,
      allowed: requestOrigin === allowedOrigin,
    });
    return response;
  }

  return applyCorsHeaders(NextResponse.next(), requestOrigin);
}

export const config = {
  matcher: '/api/:path*',
};
