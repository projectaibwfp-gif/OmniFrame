import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { ErrorCode } from './errors';
import { logError, logWarn } from './logger';

let client: NeonQueryFunction<false, false> | undefined;

export function getSql(): NeonQueryFunction<false, false> {
  if (!client) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      logError('db', ErrorCode.DB_CONNECTION_FAILED, { reason: 'DATABASE_URL not set' });
      throw new Error('DATABASE_URL environment variable is not set');
    }

    client = neon(connectionString);
  }

  return client;
}

export async function checkDatabaseConnection(): Promise<void> {
  try {
    await getSql()`SELECT 1`;
  } catch (error) {
    logWarn('db', ErrorCode.DB_CONNECTION_FAILED, { reason: 'health check query failed' }, error);
    throw error;
  }
}
