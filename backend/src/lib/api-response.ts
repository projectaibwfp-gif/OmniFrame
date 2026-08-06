import { NextResponse } from 'next/server';

export function errorResponse(message: string, status = 500): NextResponse {
  return NextResponse.json(
    {
      error: {
        message,
      },
    },
    { status },
  );
}
