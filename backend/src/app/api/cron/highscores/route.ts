import { NextResponse, type NextRequest } from 'next/server';
import { ErrorCode } from '@/lib/errors';
import { HIGHSCORE_VOCATIONS, type TibiaHighscoresVocation } from '@/lib/highscores-vocations';
import { logError, logInfo } from '@/lib/logger';
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
    .map((world) => world.trim());
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

// TODO: Add authorization (e.g., shared secret or IP allowlist) before exposing
// this endpoint beyond trusted callers. Current implementation is public.
export async function POST(_request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const worlds = readCronWorlds();
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

  stats.duration = Date.now() - startTime;
  logInfo('cron.complete', 'Cron highscores collection completed', stats);

  return NextResponse.json({ success: true, stats });
}
