import type { NextResponse, NextRequest } from 'next/server';
import { WorldParamSchema } from '@shared/api-schemas';
import { authorizeTibiaRequest, respondWithTibiaData } from '@/lib/tibiadata-api';
import { parseRouteParams } from '@/lib/request-validation';
import { fetchKillStatistics } from '@/lib/tibiadata';

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
    scope: 'killstatistics.get',
  });
  if (!validation.ok) {
    return validation.response;
  }

  const { world } = validation.data;
  return respondWithTibiaData(() => fetchKillStatistics(world), {
    scope: 'killstatistics.get',
    resource: 'Kill statistics',
    context: { world },
  });
}
