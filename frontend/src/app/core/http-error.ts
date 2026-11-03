import { HttpErrorResponse } from '@angular/common/http';
import type { ApiErrorResponseDto } from '@shared/api-contract';

export const DEFAULT_HTTP_ERROR_MESSAGE = 'Nie udało się pobrać danych z API.';
export const NETWORK_ERROR_MESSAGE = 'Brak połączenia z serwerem. Sprawdź sieć i spróbuj ponownie.';
export const UNAUTHORIZED_ERROR_MESSAGE = 'Sesja wygasła. Zaloguj się ponownie.';

export function isHttpErrorStatus(error: unknown, status: number): boolean {
  return error instanceof HttpErrorResponse && error.status === status;
}

export function extractApiErrorMessage(
  error: unknown,
  fallback: string = DEFAULT_HTTP_ERROR_MESSAGE,
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (error.status === 0) {
    return NETWORK_ERROR_MESSAGE;
  }

  if (error.status === 401) {
    return UNAUTHORIZED_ERROR_MESSAGE;
  }

  return readErrorBodyMessage(error.error) ?? fallback;
}

function readErrorBodyMessage(value: unknown): string | null {
  const body = value as ApiErrorResponseDto | { message?: string } | string | null;

  if (isApiErrorResponse(body)) {
    return body.error.message;
  }

  if (body && typeof body === 'object' && typeof body.message === 'string') {
    return body.message;
  }

  if (typeof body === 'string' && body.length > 0) {
    return body;
  }

  return null;
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponseDto {
  return (
    !!value &&
    typeof value === 'object' &&
    'error' in value &&
    !!(value as { error: unknown }).error &&
    typeof (value as ApiErrorResponseDto).error.message === 'string'
  );
}
