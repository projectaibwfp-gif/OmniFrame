import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, TibiaWorldsOverviewDto } from '@shared/api-contract';
import { authorizeTibiaRequest, tibiaDataErrorResponse } from '@/lib/tibiadata-api';
import { fetchWorlds } from '@/lib/tibiadata-extra';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const denied = await authorizeTibiaRequest(request);
  if (denied) {
    return denied;
  }

  try {
    const data = await fetchWorlds();
    return NextResponse.json<ApiResponse<TibiaWorldsOverviewDto>>({ data });
  } catch (error) {
    return tibiaDataErrorResponse(error, 'worlds.get', 'worlds', {});
  }
}
