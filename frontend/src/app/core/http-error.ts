import { HttpErrorResponse } from '@angular/common/http';
import type { ApiErrorResponseDto } from '@shared/api-contract';

export const DEFAULT_HTTP_ERROR_MESSAGE = 'Nie udało się pobrać danych z API.';
export const NETWORK_ERROR_MESSAGE = 'Brak połączenia z serwerem. Sprawdź sieć i spróbuj ponownie.';
export const UNAUTHORIZED_ERROR_MESSAGE = 'Sesja wygasła. Zaloguj się ponownie.';

export function extractApiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return DEFAULT_HTTP_ERROR_MESSAGE;
  }

  if (error.status === 0) {
    return NETWORK_ERROR_MESSAGE;
  }

  if (error.status === 401) {
    return UNAUTHORIZED_ERROR_MESSAGE;
  }

  const body = error.error as ApiErrorResponseDto | { message?: string } | string | null;

  if (isApiErrorResponse(body)) {
    return body.error.message;
  }

  if (body && typeof body === 'object' && typeof body.message === 'string') {
    return body.message;
  }

  if (typeof body === 'string' && body.length > 0) {
    return body;
  }

  return DEFAULT_HTTP_ERROR_MESSAGE;
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
