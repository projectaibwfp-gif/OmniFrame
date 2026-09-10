import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, TibiaSpellsOverviewDto } from '@shared/api-contract';
import { authorizeTibiaRequest, tibiaDataErrorResponse } from '@/lib/tibiadata-api';
import { fetchSpells } from '@/lib/tibiadata-extra';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const denied = await authorizeTibiaRequest(request);
  if (denied) {
    return denied;
  }

  try {
    const data = await fetchSpells();
    return NextResponse.json<ApiResponse<TibiaSpellsOverviewDto>>({ data });
  } catch (error) {
    return tibiaDataErrorResponse(error, 'spells.get', 'spells', {});
  }
}
