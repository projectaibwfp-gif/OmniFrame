import type { NextResponse, NextRequest } from 'next/server';
import { SpellIdParamSchema } from '@shared/api-schemas';
import { authorizeTibiaRequest, respondWithTibiaData } from '@/lib/tibiadata-api';
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

  const { spellId } = validation.data;
  return respondWithTibiaData(() => fetchSpell(spellId), {
    scope: 'spell.get',
    resource: 'spell',
    context: { spellId },
  });
}
