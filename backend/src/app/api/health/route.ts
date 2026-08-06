import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';
import { errorResponse } from '@/lib/api-response';

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
    console.error('Database health check failed', error);
    return errorResponse('Database connection failed', 503);
  }
}
