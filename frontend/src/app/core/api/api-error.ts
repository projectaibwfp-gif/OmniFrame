import type { HttpErrorResponse } from '@angular/common/http';
import type { ApiErrorResponseDto } from '@shared/api-contract';

export const UNKNOWN_API_ERROR_CODE = 'UNKNOWN_ERROR';
export const NETWORK_API_ERROR_CODE = 'NETWORK_ERROR';

/**
 * `httpError` is absent when the failure is reported in a successful response,
 * for example a background job that finished with status `failed`.
 */
export class ApiError extends Error {
  override readonly name = 'ApiError';
  readonly status: number | null;
  readonly url: string | null;

  constructor(
    readonly code: string,
    message: string,
    readonly httpError?: HttpErrorResponse,
  ) {
    super(message, { cause: httpError });
    this.status = httpError?.status ?? null;
    this.url = httpError?.url ?? null;
  }
}

export function isApiErrorResponseDto(value: unknown): value is ApiErrorResponseDto {
  if (!isRecord(value) || !isRecord(value['error'])) {
    return false;
  }

  const { code, message } = value['error'];
  return typeof code === 'string' && typeof message === 'string';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
