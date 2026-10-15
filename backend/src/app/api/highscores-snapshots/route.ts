import { NextResponse, type NextRequest } from 'next/server';
import type { HighscoresSnapshotsListDto } from '@shared/api-contract';
import { HIGHSCORES_MAX_PAGE_SIZE, HighscoresSnapshotsQuerySchema } from '@shared/api-schemas';
import { errorResponse } from '@/lib/api-response';
import { parseSearchParams } from '@/lib/request-validation';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { HttpStatus } from '@/lib/http-status';
import { listHighscoresSnapshots } from '@/lib/highscores-snapshots';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const validation = parseSearchParams(request, HighscoresSnapshotsQuerySchema, {
    scope: 'highscores-snapshots.list',
  });
  if (!validation.ok) {
    return validation.response;
  }

  const { page, pageSize: rawPageSize, world: rawWorld, sortDir } = validation.data;
  const pageSize = Math.min(rawPageSize, HIGHSCORES_MAX_PAGE_SIZE);
  const world = rawWorld.trim() || null;

  try {
    const result = await listHighscoresSnapshots(page, pageSize, world, sortDir);
    const totalPages = Math.max(1, Math.ceil(result.total / pageSize));

    const data: HighscoresSnapshotsListDto = {
      data: result.data,
      total: result.total,
      page,
      pageSize,
      totalPages,
      sortBy: 'level',
      sortDir,
      world,
      worlds: result.worlds,
    };

    return NextResponse.json<HighscoresSnapshotsListDto>(data);
  } catch (error) {
    logError(
      'highscores-snapshots.list',
      ErrorCode.DB_QUERY_FAILED,
      { page, pageSize, world },
      error,
    );
    return errorResponse(
      'Could not load highscores snapshots',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DB_QUERY_FAILED,
    );
  }
}
