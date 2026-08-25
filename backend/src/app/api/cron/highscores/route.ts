import { NextRequest, NextResponse } from 'next/server';
import { ErrorCode } from '@/lib/errors';
import { logInfo, logError } from '@/lib/logger';
import { fetchHighscoresForWorldAndVocation } from '@/lib/tibiadata';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout

interface CronStats {
  worldsProcessed: number;
  vocationsProcessed: number;
  charactersCollected: number;
  duration: number;
}

// TODO: Add authorization (e.g., shared secret or IP allowlist) before exposing
// this endpoint beyond trusted callers. Current implementation is public.
export async function POST(_request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  const worlds = (process.env.CRON_WORLDS ?? 'Dia,Amera,Antica').split(',').map((w) => w.trim());
  const vocations = ['knights', 'paladins', 'druids', 'sorcerers'] as const;

  let stats: CronStats = {
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
    logInfo(
      'cron.complete',
      'Cron highscores collection completed',
      stats as unknown as Record<string, unknown>,
    );

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    stats.duration = Date.now() - startTime;
    const message = error instanceof Error ? error.message : String(error);
    logError(
      'cron.error',
      ErrorCode.INTERNAL_ERROR,
      stats as unknown as Record<string, unknown>,
      new Error(message),
    );
    return NextResponse.json({ success: false, error: message, stats }, { status: 500 });
  }
}
