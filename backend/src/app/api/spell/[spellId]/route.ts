import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, TibiaSpellDetailsDto } from '@shared/api-contract';
import { SpellIdParamSchema } from '@shared/api-schemas';
import { authorizeTibiaRequest, tibiaDataErrorResponse } from '@/lib/tibiadata-api';
import { parseRouteParams } from '@/lib/request-validation';
import { fetchSpell } from '@/lib/tibiadata-extra';

export const dynamic = 'force-dynamic';

interface RouteParams extends Record<string, string | undefined> {
  spellId: string;
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<RouteParams> },
): Promise<NextResponse> {
  const denied = await authorizeTibiaRequest(request);
  if (denied) {
    return denied;
  }

  const validation = parseRouteParams(await props.params, SpellIdParamSchema, {
    scope: 'spell.get',
  });
  if (!validation.ok) {
    return validation.response;
  }

  try {
    const data = await fetchSpell(validation.data.spellId);
    return NextResponse.json<ApiResponse<TibiaSpellDetailsDto>>({ data });
  } catch (error) {
    return tibiaDataErrorResponse(error, 'spell.get', 'spell', {
      spellId: validation.data.spellId,
    });
  }
}
