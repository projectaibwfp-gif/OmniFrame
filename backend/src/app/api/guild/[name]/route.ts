import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, TibiaGuildDto } from '@shared/api-contract';
import { TibiaNameParamSchema } from '@shared/api-schemas';
import { authorizeTibiaRequest, tibiaDataErrorResponse } from '@/lib/tibiadata-api';
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

  try {
    const data = await fetchGuild(validation.data.name);
    return NextResponse.json<ApiResponse<TibiaGuildDto>>({ data });
  } catch (error) {
    return tibiaDataErrorResponse(error, 'guild.get', 'guild', { name: validation.data.name });
  }
}
