import { after, NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, CharacterLookupJobAcceptedDto } from '@shared/api-contract';
import { CharacterLookupRequestSchema } from '@shared/api-schemas';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import {
  CHARACTER_LOOKUP_MAX_ACTIVE_JOBS,
  enqueueCharacterLookupJob,
} from '@/lib/character-lookup-jobs';
import { processCharacterLookupJob } from '@/lib/character-lookup-worker';
import { ErrorCode } from '@/lib/errors';
import { HttpStatus } from '@/lib/http-status';
import { logError, logWarn } from '@/lib/logger';
import { parseJsonBody } from '@/lib/request-validation';
import { CharacterLookupJobState } from '@/lib/validation';

export const dynamic = 'force-dynamic';
// Next.js only accepts statically analysable literals for segment config exports;
// 60 s covers the background lookup started with after() (45 s worker timeout).
export const maxDuration = 60;

function queueFullResponse(): NextResponse {
  logWarn('characterLookups.post', ErrorCode.CHARACTER_LOOKUP_QUEUE_FULL, {
    maxActiveJobs: CHARACTER_LOOKUP_MAX_ACTIVE_JOBS,
  });
  return errorResponse(
    'Too many character lookups in progress, try again later',
    HttpStatus.TOO_MANY_REQUESTS,
    ErrorCode.CHARACTER_LOOKUP_QUEUE_FULL,
  );
}

/** Queues a character lookup (or returns the active one for the same name) and starts it after responding. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const validation = await parseJsonBody(request, CharacterLookupRequestSchema, {
    scope: 'characterLookups.post',
  });
  if (!validation.ok) {
    return validation.response;
  }

  try {
    const enqueued = await enqueueCharacterLookupJob(validation.data.name, auth.session.sub);
    if (enqueued.kind === 'queue-full') {
      return queueFullResponse();
    }

    const { jobId, status } = enqueued.job;
    if (status === CharacterLookupJobState.PENDING) {
      after(() => processCharacterLookupJob(jobId));
    }

    return NextResponse.json<ApiResponse<CharacterLookupJobAcceptedDto>>(
      { data: { jobId, status } },
      { status: HttpStatus.ACCEPTED },
    );
  } catch (error) {
    logError('characterLookups.post', ErrorCode.DB_QUERY_FAILED, {}, error);
    return errorResponse(
      'Could not queue character lookup',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DB_QUERY_FAILED,
    );
  }
}
