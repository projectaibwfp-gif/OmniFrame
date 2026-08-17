import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';
import { errorResponse } from '@/lib/api-response';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    await checkDatabaseConnection();
    return NextResponse.json({
      status: 'ok',
      service: 'project-ai-backend',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError('health', ErrorCode.DB_CONNECTION_FAILED, {}, error);
    return errorResponse('Database connection failed', 503, ErrorCode.DB_CONNECTION_FAILED);
  }
}
