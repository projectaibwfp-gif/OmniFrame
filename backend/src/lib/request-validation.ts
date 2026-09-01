import { NextResponse, type NextRequest } from 'next/server';
import { formatIssues, type Schema, type SchemaIssue } from '@shared/validation';
import { errorResponse } from './api-response';
import { ErrorCode } from './errors';
import { logError } from './logger';

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

const HTTP_BAD_REQUEST = 400;

interface ValidationOptions {
  scope: string;
  source: 'body' | 'query' | 'params';
}

function respondValidationFailure(
  issues: readonly SchemaIssue[],
  { scope, source }: ValidationOptions,
): NextResponse {
  logError(scope, ErrorCode.VALIDATION_FAILED, { source, issues });
  return errorResponse(
    `Request ${source} is invalid: ${formatIssues(issues)}`,
    HTTP_BAD_REQUEST,
    ErrorCode.VALIDATION_FAILED,
  );
}

export async function parseJsonBody<T>(
  request: NextRequest,
  schema: Schema<T>,
  options: Omit<ValidationOptions, 'source'>,
): Promise<ValidationResult<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch (error) {
    logError(options.scope, ErrorCode.REQUEST_INVALID_JSON, {}, error);
    return {
      ok: false,
      response: errorResponse(
        'Request body must be valid JSON',
        HTTP_BAD_REQUEST,
        ErrorCode.REQUEST_INVALID_JSON,
      ),
    };
  }

  const result = schema.parse(raw);
  if (!result.ok) {
    return {
      ok: false,
      response: respondValidationFailure(result.issues, { ...options, source: 'body' }),
    };
  }
  return { ok: true, data: result.data };
}

export function parseSearchParams<T>(
  request: NextRequest,
  schema: Schema<T>,
  options: Omit<ValidationOptions, 'source'>,
): ValidationResult<T> {
  const raw: Record<string, string> = {};
  for (const [key, value] of request.nextUrl.searchParams.entries()) {
    raw[key] = value;
  }
  const result = schema.parse(raw);
  if (!result.ok) {
    return {
      ok: false,
      response: respondValidationFailure(result.issues, { ...options, source: 'query' }),
    };
  }
  return { ok: true, data: result.data };
}

export function parseRouteParams<T>(
  params: Record<string, string | undefined>,
  schema: Schema<T>,
  options: Omit<ValidationOptions, 'source'>,
): ValidationResult<T> {
  const decoded: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    decoded[key] = value === undefined ? undefined : safeDecodeURIComponent(value);
  }
  const result = schema.parse(decoded);
  if (!result.ok) {
    return {
      ok: false,
      response: respondValidationFailure(result.issues, { ...options, source: 'params' }),
    };
  }
  return { ok: true, data: result.data };
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
