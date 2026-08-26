import { NextResponse, type NextRequest } from 'next/server';
import { ErrorCode } from '@/lib/errors';
import { logInfo, logError } from '@/lib/logger';
import { fetchHighscoresForWorldAndVocation } from '@/lib/tibiadata';

const DEFAULT_CRON_WORLDS = 'Dia,Amera,Antica';
const CRON_VOCATIONS = ['knights', 'paladins', 'druids', 'sorcerers'] as const;

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

// TODO: Add authorization (e.g., shared secret or IP allowlist) before exposing
// this endpoint beyond trusted callers. Current implementation is public.
export async function POST(_request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  const worlds = (process.env.CRON_WORLDS ?? DEFAULT_CRON_WORLDS).split(',').map((w) => w.trim());
  const vocations = CRON_VOCATIONS;

  const stats: CronStats = {
    worldsProcessed: 0,
    vocationsProcessed: 0,
    charactersCollected: 0,
    duration: 0,
  };

  try {
    logInfo('cron.start', 'Starting cron highscores collection', {
      worlds: worlds.length,
      vocations: vocations.length,
    });

    for (const world of worlds) {
      for (const vocation of vocations) {
        try {
          const count = await fetchHighscoresForWorldAndVocation(world, vocation);
          stats.vocationsProcessed += 1;
          stats.charactersCollected += count;
          logInfo('cron.vocation', `Processed ${world}/${vocation}`, { count });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          logError(
            'cron.vocation',
            ErrorCode.INTERNAL_ERROR,
            { world, vocation },
            new Error(message),
          );
        }
      }
      stats.worldsProcessed += 1;
    }

    stats.duration = Date.now() - startTime;
    logInfo('cron.complete', 'Cron highscores collection completed', stats);

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    stats.duration = Date.now() - startTime;
    const message = error instanceof Error ? error.message : String(error);
    logError('cron.error', ErrorCode.INTERNAL_ERROR, stats, new Error(message));
    return NextResponse.json({ success: false, error: message, stats }, { status: 500 });
  }
}
