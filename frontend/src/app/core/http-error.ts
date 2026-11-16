import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import {
  ApiError,
  isApiErrorResponseDto,
  NETWORK_API_ERROR_CODE,
  UNKNOWN_API_ERROR_CODE,
} from './api/api-error';

export const DEFAULT_HTTP_ERROR_MESSAGE = 'Nie udało się pobrać danych z API.';
export const NETWORK_ERROR_MESSAGE = 'Brak połączenia z serwerem. Sprawdź sieć i spróbuj ponownie.';
export const UNAUTHORIZED_ERROR_MESSAGE = 'Sesja wygasła. Zaloguj się ponownie.';

const NETWORK_ERROR_STATUS = 0;

export function isHttpErrorStatus(error: unknown, status: number): boolean {
  return (
    (error instanceof ApiError || error instanceof HttpErrorResponse) && error.status === status
  );
}

export function extractApiErrorMessage(
  error: unknown,
  fallback: string = DEFAULT_HTTP_ERROR_MESSAGE,
): string {
  if (error instanceof ApiError && !error.httpError) {
    return error.message;
  }

  const httpError = error instanceof ApiError ? error.httpError : error;

  if (!(httpError instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (httpError.status === NETWORK_ERROR_STATUS) {
    return NETWORK_ERROR_MESSAGE;
  }

  if (httpError.status === HttpStatusCode.Unauthorized) {
    return UNAUTHORIZED_ERROR_MESSAGE;
  }

  return readErrorBodyMessage(httpError.error) ?? fallback;
}

export function toApiError(httpError: HttpErrorResponse): ApiError {
  const body: unknown = httpError.error;

  if (isApiErrorResponseDto(body)) {
    return new ApiError(body.error.code, body.error.message, httpError);
  }

  return new ApiError(
    resolveFallbackErrorCode(httpError.status),
    extractApiErrorMessage(httpError),
    httpError,
  );
}

function resolveFallbackErrorCode(status: number): string {
  return status === NETWORK_ERROR_STATUS ? NETWORK_API_ERROR_CODE : UNKNOWN_API_ERROR_CODE;
}

function readErrorBodyMessage(value: unknown): string | null {
  if (isApiErrorResponseDto(value)) {
    return value.error.message;
  }

  const body = value as { message?: string } | string | null;

  if (body && typeof body === 'object' && typeof body.message === 'string') {
    return body.message;
  }

  if (typeof body === 'string' && body.length > 0) {
    return body;
  }

  return null;
}
