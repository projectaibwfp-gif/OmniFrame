import type { NextResponse, NextRequest } from 'next/server';
import { handleTibiaDataGet } from '@/lib/tibiadata-api';
import { fetchSpells } from '@/lib/tibiadata-extra';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest): Promise<NextResponse> {
  return handleTibiaDataGet(request, fetchSpells, { scope: 'spells.get', resource: 'spells' });
}
