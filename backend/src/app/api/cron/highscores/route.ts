import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, CronHighscoresWorldsDto } from '@shared/api-contract';
import { CronHighscoresQuerySchema } from '@shared/api-schemas';
import { errorResponse } from '@/lib/api-response';
import { denyUnauthorizedCronRequest } from '@/lib/cron-auth';
import { pruneExpiredHistory } from '@/lib/data-retention';
import { ErrorCode } from '@/lib/errors';
import { HIGHSCORE_VOCATIONS, type TibiaHighscoresVocation } from '@/lib/highscores-vocations';
import { HttpStatus } from '@/lib/http-status';
import { logError, logInfo } from '@/lib/logger';
import { parseSearchParams } from '@/lib/request-validation';
import { fetchHighscoresForWorldAndVocation } from '@/lib/tibiadata';

const DEFAULT_CRON_WORLDS = 'Dia,Amera,Antica';
const CRON_WORLDS_SEPARATOR = ',';

export const dynamic = 'force-dynamic';
// Next.js only accepts statically analysable literals for segment config exports,
// so this 5 minute budget cannot be extracted into a named constant.
export const maxDuration = 300;

interface CronStats extends Record<string, unknown> {
  worldsProcessed: number;
  vocationsProcessed: number;
  charactersCollected: number;
  duration: number;
}

function readCronWorlds(): string[] {
  return (process.env.CRON_WORLDS ?? DEFAULT_CRON_WORLDS)
    .split(CRON_WORLDS_SEPARATOR)
    .map((world) => world.trim())
    .filter(Boolean);
}

async function collectVocation(
  world: string,
  vocation: TibiaHighscoresVocation,
  stats: CronStats,
): Promise<void> {
  try {
    const count = await fetchHighscoresForWorldAndVocation(world, vocation);
    stats.vocationsProcessed += 1;
    stats.charactersCollected += count;
    logInfo('cron.vocation', `Processed ${world}/${vocation}`, { count });
  } catch (error) {
    logError('cron.vocation', ErrorCode.INTERNAL_ERROR, { world, vocation }, error);
  }
}

async function pruneHistory(): Promise<void> {
  try {
    logInfo('cron.prune', 'Pruned expired history', await pruneExpiredHistory());
  } catch (error) {
    logError('cron.prune', ErrorCode.DB_QUERY_FAILED, {}, error);
  }
}

/** Lists the configured worlds so callers can run POST once per world. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const denied = denyUnauthorizedCronRequest(request);
  if (denied) {
    return denied;
  }

  return NextResponse.json<ApiResponse<CronHighscoresWorldsDto>>({
    data: { worlds: readCronWorlds() },
  });
}

/**
 * Collects highscores for one world (`?world=`) or for every configured world.
 * A single world per call keeps each run well inside `maxDuration`.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const denied = denyUnauthorizedCronRequest(request);
  if (denied) {
    return denied;
  }

  const query = parseSearchParams(request, CronHighscoresQuerySchema, { scope: 'cron.highscores' });
  if (!query.ok) {
    return query.response;
  }

  const configuredWorlds = readCronWorlds();
  const requestedWorld = query.data.world;
  if (requestedWorld && !configuredWorlds.includes(requestedWorld)) {
    return errorResponse(
      `World ${requestedWorld} is not configured in CRON_WORLDS`,
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_FAILED,
    );
  }

  const worlds = requestedWorld ? [requestedWorld] : configuredWorlds;
  const startTime = Date.now();
  const stats: CronStats = {
    worldsProcessed: 0,
    vocationsProcessed: 0,
    charactersCollected: 0,
    duration: 0,
  };

  logInfo('cron.start', 'Starting cron highscores collection', {
    worlds: worlds.length,
    vocations: HIGHSCORE_VOCATIONS.length,
  });

  for (const world of worlds) {
    for (const vocation of HIGHSCORE_VOCATIONS) {
      await collectVocation(world, vocation, stats);
    }
    stats.worldsProcessed += 1;
  }

  await pruneHistory();

  stats.duration = Date.now() - startTime;
  logInfo('cron.complete', 'Cron highscores collection completed', stats);

  return NextResponse.json({ success: true, stats });
}
