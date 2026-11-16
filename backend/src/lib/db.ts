import { neon, neonConfig, type NeonQueryFunction } from '@neondatabase/serverless';
import { ErrorCode } from './errors';
import { logError, logWarn } from './logger';
import { createRetryingFetch } from './retry';

const NEON_RETRY_ATTEMPTS = 3;
const NEON_RETRY_BASE_DELAY_MS = 200;

let client: NeonQueryFunction<false, false> | undefined;

export function getSql(): NeonQueryFunction<false, false> {
  if (!client) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      logError('db', ErrorCode.DB_CONNECTION_FAILED, { reason: 'DATABASE_URL not set' });
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Neon's HTTP driver answers SQL errors with 4xx, so only network failures
    // and gateway statuses (cold compute, proxy hiccups) are retried.
    neonConfig.fetchFunction = createRetryingFetch((input, init) => fetch(input, init), {
      attempts: NEON_RETRY_ATTEMPTS,
      baseDelayMs: NEON_RETRY_BASE_DELAY_MS,
    });
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
