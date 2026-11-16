import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, CronCharacterLookupsStatsDto } from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { processCharacterLookupBatch } from '@/lib/character-lookup-worker';
import { denyUnauthorizedCronRequest } from '@/lib/cron-auth';
import { ErrorCode } from '@/lib/errors';
import { HttpStatus } from '@/lib/http-status';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';
// Next.js only accepts statically analysable literals for segment config exports;
// 300 s fits a full batch of sequential lookups, each capped by the worker timeout.
export const maxDuration = 300;

/** Processes a batch of pending and stuck character lookup jobs. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const denied = denyUnauthorizedCronRequest(request);
  if (denied) {
    return denied;
  }

  try {
    const stats = await processCharacterLookupBatch();
    return NextResponse.json<ApiResponse<CronCharacterLookupsStatsDto>>({ data: stats });
  } catch (error) {
    logError('cron.characterLookups', ErrorCode.DB_QUERY_FAILED, {}, error);
    return errorResponse(
      'Could not process character lookup jobs',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DB_QUERY_FAILED,
    );
  }
}
