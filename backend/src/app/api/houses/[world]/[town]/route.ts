import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, TibiaHousesOverviewDto } from '@shared/api-contract';
import { WorldTownParamSchema } from '@shared/api-schemas';
import { authorizeTibiaRequest, tibiaDataErrorResponse } from '@/lib/tibiadata-api';
import { parseRouteParams } from '@/lib/request-validation';
import { fetchHouses } from '@/lib/tibiadata-extra';

export const dynamic = 'force-dynamic';

interface RouteParams extends Record<string, string | undefined> {
  world: string;
  town: string;
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<RouteParams> },
): Promise<NextResponse> {
  const denied = await authorizeTibiaRequest(request);
  if (denied) {
    return denied;
  }

  const validation = parseRouteParams(await props.params, WorldTownParamSchema, {
    scope: 'houses.get',
  });
  if (!validation.ok) {
    return validation.response;
  }

  try {
    const data = await fetchHouses(validation.data.world, validation.data.town);
    return NextResponse.json<ApiResponse<TibiaHousesOverviewDto>>({ data });
  } catch (error) {
    return tibiaDataErrorResponse(error, 'houses.get', 'houses', {
      world: validation.data.world,
      town: validation.data.town,
    });
  }
}
