import type { NextResponse, NextRequest } from 'next/server';
import { WorldTownParamSchema } from '@shared/api-schemas';
import { authorizeTibiaRequest, respondWithTibiaData } from '@/lib/tibiadata-api';
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

  const { world, town } = validation.data;
  return respondWithTibiaData(() => fetchHouses(world, town), {
    scope: 'houses.get',
    resource: 'houses',
    context: { world, town },
  });
}
