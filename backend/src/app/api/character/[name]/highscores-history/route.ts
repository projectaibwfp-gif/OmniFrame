import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, CharacterHighscoresHistoryDto } from '@shared/api-contract';
import { CharacterNameParamSchema } from '@shared/api-schemas';
import { errorResponse } from '@/lib/api-response';
import { parseRouteParams } from '@/lib/request-validation';
import { ErrorCode } from '@/lib/errors';
import { listCharacterHighscoresHistory } from '@/lib/highscores-snapshots';
import { HttpStatus } from '@/lib/http-status';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

interface RouteParams extends Record<string, string | undefined> {
  name: string;
}

export async function GET(
  _request: NextRequest,
  props: { params: Promise<RouteParams> },
): Promise<NextResponse> {
  const validation = parseRouteParams(await props.params, CharacterNameParamSchema, {
    scope: 'character.highscores-history',
  });
  if (!validation.ok) {
    return validation.response;
  }

  const characterName = validation.data.name;

  try {
    const snapshots = await listCharacterHighscoresHistory(characterName);
    return NextResponse.json<ApiResponse<CharacterHighscoresHistoryDto>>({
      data: { data: snapshots, total: snapshots.length },
    });
  } catch (error) {
    logError('character.highscores-history', ErrorCode.DB_QUERY_FAILED, { characterName }, error);
    return errorResponse(
      'Could not load character highscores history',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DB_QUERY_FAILED,
    );
  }
}
