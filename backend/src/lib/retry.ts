import { HttpStatus } from './http-status';

export interface RetryOptions {
  attempts: number;
  baseDelayMs: number;
  shouldRetry: (error: unknown) => boolean;
}

export const TRANSIENT_HTTP_STATUSES: ReadonlySet<number> = new Set([
  HttpStatus.TOO_MANY_REQUESTS,
  HttpStatus.BAD_GATEWAY,
  HttpStatus.SERVICE_UNAVAILABLE,
  HttpStatus.GATEWAY_TIMEOUT,
]);

const BACKOFF_MULTIPLIER = 2;

/** Raised for a response worth repeating; carries the status for logs and callers. */
export class TransientHttpError extends Error {
  constructor(readonly status: number) {
    super(`Transient HTTP status ${status}`);
    this.name = 'TransientHttpError';
  }
}

function backoffDelay(attempt: number, baseDelayMs: number): number {
  return baseDelayMs * BACKOFF_MULTIPLIER ** (attempt - 1);
}

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

/**
 * Network failures and timeouts throw from `fetch` (TypeError, AbortError,
 * TimeoutError); HTTP-level transient failures are raised as TransientHttpError.
 */
export function isTransientFetchError(error: unknown): boolean {
  return error instanceof TransientHttpError || error instanceof TypeError || isAbortLike(error);
}

function isAbortLike(error: unknown): boolean {
  return (
    error instanceof DOMException && (error.name === 'AbortError' || error.name === 'TimeoutError')
  );
}

export async function withRetry<T>(operation: () => Promise<T>, options: RetryOptions): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= options.attempts || !options.shouldRetry(error)) {
        throw error;
      }
      await wait(backoffDelay(attempt, options.baseDelayMs));
    }
  }
}

/**
 * Wraps fetch so transient statuses are retried with backoff. The last transient
 * response is returned unchanged, so callers keep their own status handling.
 */
export function createRetryingFetch(
  fetchFunction: typeof fetch,
  options: Omit<RetryOptions, 'shouldRetry'>,
  createInit: () => RequestInit = () => ({}),
): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
  return async (input, init) => {
    let lastTransientResponse: Response | undefined;
    try {
      return await withRetry(
        async () => {
          const response = await fetchFunction(input, { ...init, ...createInit() });
          if (TRANSIENT_HTTP_STATUSES.has(response.status)) {
            lastTransientResponse = response;
            throw new TransientHttpError(response.status);
          }
          return response;
        },
        { ...options, shouldRetry: isTransientFetchError },
      );
    } catch (error) {
      if (error instanceof TransientHttpError && lastTransientResponse) {
        return lastTransientResponse;
      }
      throw error;
    }
  };
}
