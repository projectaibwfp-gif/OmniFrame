import type { NextResponse, NextRequest } from 'next/server';
import { handleTibiaDataGet } from '@/lib/tibiadata-api';
import { fetchCreatures } from '@/lib/tibiadata';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest): Promise<NextResponse> {
  return handleTibiaDataGet(request, fetchCreatures, {
    scope: 'creatures.get',
    resource: 'creatures',
  });
}
