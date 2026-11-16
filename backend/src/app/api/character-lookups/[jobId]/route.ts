import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, CharacterLookupJobDto } from '@shared/api-contract';
import { CharacterLookupJobIdParamSchema } from '@shared/api-schemas';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { getCharacterLookupJob } from '@/lib/character-lookup-jobs';
import { ErrorCode } from '@/lib/errors';
import { HttpStatus } from '@/lib/http-status';
import { logError } from '@/lib/logger';
import { parseRouteParams } from '@/lib/request-validation';

export const dynamic = 'force-dynamic';

interface RouteParams extends Record<string, string | undefined> {
  jobId: string;
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<RouteParams> },
): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  const validation = parseRouteParams(await props.params, CharacterLookupJobIdParamSchema, {
    scope: 'characterLookups.get',
  });
  if (!validation.ok) {
    return validation.response;
  }

  const { jobId } = validation.data;

  try {
    const job = await getCharacterLookupJob(jobId);
    if (!job) {
      return errorResponse(
        'Character lookup job not found',
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND,
      );
    }

    return NextResponse.json<ApiResponse<CharacterLookupJobDto>>({ data: job });
  } catch (error) {
    logError('characterLookups.get', ErrorCode.DB_QUERY_FAILED, { jobId }, error);
    return errorResponse(
      'Could not load character lookup job',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DB_QUERY_FAILED,
    );
  }
}
