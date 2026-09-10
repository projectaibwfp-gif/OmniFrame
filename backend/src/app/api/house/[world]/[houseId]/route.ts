import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, TibiaHouseDto } from '@shared/api-contract';
import { HouseIdParamSchema } from '@shared/api-schemas';
import { authorizeTibiaRequest, tibiaDataErrorResponse } from '@/lib/tibiadata-api';
import { parseRouteParams } from '@/lib/request-validation';
import { fetchHouse } from '@/lib/tibiadata-extra';

export const dynamic = 'force-dynamic';

interface RouteParams extends Record<string, string | undefined> {
  world: string;
  houseId: string;
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<RouteParams> },
): Promise<NextResponse> {
  const denied = await authorizeTibiaRequest(request);
  if (denied) {
    return denied;
  }

  const validation = parseRouteParams(await props.params, HouseIdParamSchema, {
    scope: 'house.get',
  });
  if (!validation.ok) {
    return validation.response;
  }

  try {
    const data = await fetchHouse(validation.data.world, validation.data.houseId);
    return NextResponse.json<ApiResponse<TibiaHouseDto>>({ data });
  } catch (error) {
    return tibiaDataErrorResponse(error, 'house.get', 'house', {
      world: validation.data.world,
      houseId: validation.data.houseId,
    });
  }
}
