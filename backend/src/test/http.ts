import { NextRequest, NextResponse } from 'next/server';

export function createRequest(url: string, init?: RequestInit): NextRequest {
  return new NextRequest(new Request(url, init));
}

export function createJsonRequest(
  url: string,
  method: string,
  body: unknown | string,
): NextRequest {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);

  return createRequest(url, {
    method,
    headers: {
      'content-type': 'application/json',
    },
    body: payload,
  });
}

export function createDeniedResponse(
  status = 401,
  message = 'Authentication required',
): NextResponse {
  return NextResponse.json(
    {
      error: {
        message,
      },
    },
    { status },
  );
}
