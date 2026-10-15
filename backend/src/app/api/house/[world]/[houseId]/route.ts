import type { NextResponse, NextRequest } from 'next/server';
import { HouseIdParamSchema } from '@shared/api-schemas';
import { authorizeTibiaRequest, respondWithTibiaData } from '@/lib/tibiadata-api';
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

  const { world, houseId } = validation.data;
  return respondWithTibiaData(() => fetchHouse(world, houseId), {
    scope: 'house.get',
    resource: 'house',
    context: { world, houseId },
  });
}
