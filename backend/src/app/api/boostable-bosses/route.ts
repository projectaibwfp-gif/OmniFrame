import type { NextResponse, NextRequest } from 'next/server';
import { handleTibiaDataGet } from '@/lib/tibiadata-api';
import { fetchBoostableBosses } from '@/lib/tibiadata';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest): Promise<NextResponse> {
  return handleTibiaDataGet(request, fetchBoostableBosses, {
    scope: 'boostable-bosses.get',
    resource: 'boostable bosses',
  });
}
