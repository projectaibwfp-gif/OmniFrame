import { NextResponse } from 'next/server';
import type { HealthStatusDto } from '@shared/api-contract';
import { checkDatabaseConnection } from '@/lib/db';
import { errorResponse } from '@/lib/api-response';
import { toIsoUtc } from '@/lib/date-time';
import { ErrorCode } from '@/lib/errors';
import { HttpStatus } from '@/lib/http-status';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const SERVICE_NAME = 'project-ai-backend';
const HEALTHY_STATUS: HealthStatusDto['status'] = 'ok';
const DATABASE_CONNECTED: HealthStatusDto['database'] = 'connected';

export async function GET(): Promise<NextResponse> {
  try {
    await checkDatabaseConnection();
    return NextResponse.json<HealthStatusDto>({
      status: HEALTHY_STATUS,
      service: SERVICE_NAME,
      database: DATABASE_CONNECTED,
      timestamp: toIsoUtc(new Date()),
    });
  } catch (error) {
    logError('health', ErrorCode.DB_CONNECTION_FAILED, {}, error);
    return errorResponse(
      'Database connection failed',
      HttpStatus.SERVICE_UNAVAILABLE,
      ErrorCode.DB_CONNECTION_FAILED,
    );
  }
}
