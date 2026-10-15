import type { NextResponse, NextRequest } from 'next/server';
import { TibiaNameParamSchema } from '@shared/api-schemas';
import { authorizeTibiaRequest, respondWithTibiaData } from '@/lib/tibiadata-api';
import { parseRouteParams } from '@/lib/request-validation';
import { fetchGuild } from '@/lib/tibiadata-extra';

export const dynamic = 'force-dynamic';

interface RouteParams extends Record<string, string | undefined> {
  name: string;
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<RouteParams> },
): Promise<NextResponse> {
  const denied = await authorizeTibiaRequest(request);
  if (denied) {
    return denied;
  }

  const validation = parseRouteParams(await props.params, TibiaNameParamSchema, {
    scope: 'guild.get',
  });
  if (!validation.ok) {
    return validation.response;
  }

  const { name } = validation.data;
  return respondWithTibiaData(() => fetchGuild(name), {
    scope: 'guild.get',
    resource: 'guild',
    context: { name },
  });
}
