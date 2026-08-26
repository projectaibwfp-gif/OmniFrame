import { NextResponse, type NextRequest } from 'next/server';
import type { HighscoresSnapshotsListDto } from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { listHighscoresSnapshots } from '@/lib/highscores-snapshots';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

function toPositiveInteger(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const page = toPositiveInteger(request.nextUrl.searchParams.get('page'), DEFAULT_PAGE);
  const pageSize = Math.min(
    toPositiveInteger(request.nextUrl.searchParams.get('pageSize'), DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );
  const worldParam = request.nextUrl.searchParams.get('world');
  const world = worldParam?.trim() ? worldParam.trim() : null;
  const sortDirRaw = request.nextUrl.searchParams.get('sortDir');
  const sortDir: 'asc' | 'desc' = sortDirRaw === 'asc' ? 'asc' : 'desc';

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
    return errorResponse('Could not load highscores snapshots', 500, ErrorCode.DB_QUERY_FAILED);
  }
}
