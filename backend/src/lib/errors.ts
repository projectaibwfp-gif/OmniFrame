/**
 * Stable, machine-readable error codes returned in every error response as
 * `error.code`. Keep these coarse-grained and stable so the frontend (and logs)
 * can branch on them without parsing free-text messages.
 */
export const ErrorCode = {
  REQUEST_INVALID_JSON: 'REQUEST_INVALID_JSON',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID_LOGIN_STATE: 'AUTH_INVALID_LOGIN_STATE',
  AUTH_GOOGLE_TOKEN_INVALID: 'AUTH_GOOGLE_TOKEN_INVALID',
  AUTH_USER_UPSERT_FAILED: 'AUTH_USER_UPSERT_FAILED',
  AUTH_REFRESH_FAILED: 'AUTH_REFRESH_FAILED',
  NOT_FOUND: 'NOT_FOUND',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  DB_CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
