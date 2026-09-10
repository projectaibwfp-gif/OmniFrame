import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, TibiaFansitesDto } from '@shared/api-contract';
import { authorizeTibiaRequest, tibiaDataErrorResponse } from '@/lib/tibiadata-api';
import { fetchFansites } from '@/lib/tibiadata-extra';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const denied = await authorizeTibiaRequest(request);
  if (denied) {
    return denied;
  }

  try {
    const data = await fetchFansites();
    return NextResponse.json<ApiResponse<TibiaFansitesDto>>({ data });
  } catch (error) {
    return tibiaDataErrorResponse(error, 'fansites.get', 'fansites', {});
  }
}
