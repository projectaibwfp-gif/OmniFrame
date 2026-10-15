import type { NextResponse, NextRequest } from 'next/server';
import { handleTibiaDataGet } from '@/lib/tibiadata-api';
import { fetchNews } from '@/lib/tibiadata';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest): Promise<NextResponse> {
  return handleTibiaDataGet(request, fetchNews, {
    scope: 'news.get',
    resource: 'Tibia news',
    messages: { loadFailed: 'Could not load Tibia news' },
  });
}
