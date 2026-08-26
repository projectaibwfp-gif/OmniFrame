import { NextResponse } from 'next/server';
import { openApiDocument } from '@/lib/openapi';

export function GET(): NextResponse {
  return NextResponse.json(openApiDocument);
}
