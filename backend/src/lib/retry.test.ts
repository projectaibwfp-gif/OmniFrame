import { describe, expect, it, vi } from 'vitest';
import { HttpStatus } from './http-status';
import { createRetryingFetch, isTransientFetchError, TransientHttpError, withRetry } from './retry';

const NO_DELAY = { attempts: 3, baseDelayMs: 0 };
const REQUEST_URL = 'https://example.test/resource';

function statusResponse(status: number): Response {
  return new Response(null, { status });
}

describe('withRetry', () => {
  it('returns the first successful result after transient failures', async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new TypeError('network down'))
      .mockResolvedValueOnce('ok');

    await expect(withRetry(operation, { ...NO_DELAY, shouldRetry: () => true })).resolves.toBe(
      'ok',
    );
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('rethrows non-retryable errors immediately', async () => {
    const operation = vi.fn<() => Promise<string>>().mockRejectedValue(new Error('bad input'));

    await expect(withRetry(operation, { ...NO_DELAY, shouldRetry: () => false })).rejects.toThrow(
      'bad input',
    );
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('gives up after the configured number of attempts', async () => {
    const operation = vi.fn<() => Promise<string>>().mockRejectedValue(new TypeError('down'));

    await expect(withRetry(operation, { ...NO_DELAY, shouldRetry: () => true })).rejects.toThrow(
      'down',
    );
    expect(operation).toHaveBeenCalledTimes(NO_DELAY.attempts);
  });
});

describe('isTransientFetchError', () => {
  it.each([
    ['network TypeError', new TypeError('fetch failed'), true],
    ['timeout', new DOMException('timed out', 'TimeoutError'), true],
    ['abort', new DOMException('aborted', 'AbortError'), true],
    ['transient status', new TransientHttpError(HttpStatus.SERVICE_UNAVAILABLE), true],
    ['plain error', new Error('boom'), false],
  ])('classifies %s', (_label, error, expected) => {
    expect(isTransientFetchError(error)).toBe(expected);
  });
});

describe('createRetryingFetch', () => {
  it('retries gateway statuses and returns the successful response', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(statusResponse(HttpStatus.BAD_GATEWAY))
      .mockResolvedValueOnce(statusResponse(HttpStatus.OK));

    const response = await createRetryingFetch(fetchMock, NO_DELAY)(REQUEST_URL);

    expect(response.status).toBe(HttpStatus.OK);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns the last transient response when retries run out', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementation(() => Promise.resolve(statusResponse(HttpStatus.TOO_MANY_REQUESTS)));

    const response = await createRetryingFetch(fetchMock, NO_DELAY)(REQUEST_URL);

    expect(response.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(fetchMock).toHaveBeenCalledTimes(NO_DELAY.attempts);
  });

  it('does not retry client errors', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(statusResponse(HttpStatus.NOT_FOUND));

    const response = await createRetryingFetch(fetchMock, NO_DELAY)(REQUEST_URL);

    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('builds fresh request options for every attempt', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError('network down'))
      .mockResolvedValueOnce(statusResponse(HttpStatus.OK));
    const createInit = vi.fn(() => ({ cache: 'no-store' as const }));

    await createRetryingFetch(fetchMock, NO_DELAY, createInit)(REQUEST_URL);

    expect(createInit).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(REQUEST_URL, { cache: 'no-store' });
  });
});
