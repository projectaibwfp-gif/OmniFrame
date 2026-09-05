import { NextResponse, type NextRequest } from 'next/server';
import type { HighscoresSnapshotRecordDto, ApiResponse } from '@shared/api-contract';
import { CharacterNameParamSchema } from '@shared/api-schemas';
import { errorResponse } from '@/lib/api-response';
import { parseRouteParams } from '@/lib/request-validation';
import { getSql } from '@/lib/db';
import { toIsoUtc, type SqlTimestamp } from '@/lib/date-time';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

interface HighscoresHistoryRow {
  id: number;
  characterName: string;
  world: string;
  vocation: string;
  level: number;
  rank: number;
  exactExperience: number;
  checkedAt: SqlTimestamp;
}

interface RouteParams extends Record<string, string | undefined> {
  name: string;
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<RouteParams> },
): Promise<NextResponse> {
  const params = await props.params;
  const validation = parseRouteParams(params, CharacterNameParamSchema, {
    scope: 'character.highscores-history',
  });
  if (!validation.ok) {
    return validation.response;
  }

  const characterName = validation.data.name;

  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT id,
             character_name AS "characterName",
             world,
             vocation,
             level,
             rank,
             exact_experience AS "exactExperience",
             checked_at AS "checkedAt"
      FROM character_highscores_snapshots
      WHERE normalized_name = ${characterName.toLowerCase()}
      ORDER BY checked_at DESC
      LIMIT 500
    `) as HighscoresHistoryRow[];

    const data: HighscoresSnapshotRecordDto[] = rows.map((row) => ({
      id: row.id,
      characterName: row.characterName,
      world: row.world,
      vocation: row.vocation,
      level: row.level,
      rank: row.rank,
      exactExperience: row.exactExperience,
      checkedAt: toIsoUtc(row.checkedAt),
    }));

    const response: ApiResponse<{ data: HighscoresSnapshotRecordDto[]; total: number }> = {
      data: { data, total: data.length },
    };

    return NextResponse.json(response);
  } catch (error) {
    logError('character.highscores-history', ErrorCode.DB_QUERY_FAILED, { characterName }, error);
    return errorResponse(
      'Could not load character highscores history',
      500,
      ErrorCode.DB_QUERY_FAILED,
    );
  }
}
