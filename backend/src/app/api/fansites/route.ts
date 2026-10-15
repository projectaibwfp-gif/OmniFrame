import type { NextResponse, NextRequest } from 'next/server';
import { handleTibiaDataGet } from '@/lib/tibiadata-api';
import { fetchFansites } from '@/lib/tibiadata-extra';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest): Promise<NextResponse> {
  return handleTibiaDataGet(request, fetchFansites, {
    scope: 'fansites.get',
    resource: 'fansites',
  });
}
