import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, TibiaGuildsOverviewDto } from '@shared/api-contract';
import { WorldParamSchema } from '@shared/api-schemas';
import { authorizeTibiaRequest, tibiaDataErrorResponse } from '@/lib/tibiadata-api';
import { parseRouteParams } from '@/lib/request-validation';
import { fetchGuilds } from '@/lib/tibiadata-extra';

export const dynamic = 'force-dynamic';

interface RouteParams extends Record<string, string | undefined> {
  world: string;
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<RouteParams> },
): Promise<NextResponse> {
  const denied = await authorizeTibiaRequest(request);
  if (denied) {
    return denied;
  }

  const validation = parseRouteParams(await props.params, WorldParamSchema, {
    scope: 'guilds.get',
  });
  if (!validation.ok) {
    return validation.response;
  }

  try {
    const data = await fetchGuilds(validation.data.world);
    return NextResponse.json<ApiResponse<TibiaGuildsOverviewDto>>({ data });
  } catch (error) {
    return tibiaDataErrorResponse(error, 'guilds.get', 'guilds', {
      world: validation.data.world,
    });
  }
}
