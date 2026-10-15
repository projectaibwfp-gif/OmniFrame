import { HttpStatus } from './http-status';
import { asRecord, type JsonRecord } from './json-readers';

const DEFAULT_TIBIA_DATA_API_BASE_URL = 'https://dev.tibiadata.com/v4';
const DEFAULT_NOT_FOUND_MESSAGE = 'TibiaData resource not found';

export const TIBIA_DATA_API_BASE_URL =
  process.env.TIBIA_DATA_API_BASE_URL?.trim() || DEFAULT_TIBIA_DATA_API_BASE_URL;

export const TIBIA_DATA_TIMEOUT_MS = 10_000;

export class TibiaDataNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TibiaDataNotFoundError';
  }
}

export function requestTibiaData(path: string): Promise<Response> {
  return fetch(`${TIBIA_DATA_API_BASE_URL}${path}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(TIBIA_DATA_TIMEOUT_MS),
  });
}

/**
 * Fetches a TibiaData resource and returns its JSON object payload. The generic
 * parameter only narrows the static type - TibiaData fields stay optional/unknown
 * and must still be read defensively by the caller.
 */
export async function fetchTibiaJson<T extends object = JsonRecord>(
  path: string,
  notFoundMessage: string = DEFAULT_NOT_FOUND_MESSAGE,
): Promise<T> {
  const response = await requestTibiaData(path);

  if (response.status === HttpStatus.NOT_FOUND) {
    throw new TibiaDataNotFoundError(notFoundMessage);
  }

  if (!response.ok) {
    throw new Error(`TibiaData request failed with status ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (!asRecord(payload)) {
    throw new Error('Invalid TibiaData response');
  }

  return payload as T;
}
