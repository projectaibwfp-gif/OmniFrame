import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse } from '@shared/api-contract';
import { errorResponse } from './api-response';
import { isAuthDenied, requireAuth } from './auth';
import { ErrorCode } from './errors';
import { HttpStatus } from './http-status';
import { logError } from './logger';
import { TibiaDataNotFoundError } from './tibiadata';

export interface TibiaDataErrorMessages {
  notFound: string;
  loadFailed: string;
}

export interface TibiaDataErrorOptions {
  /** Logger scope, e.g. `worlds.get`. */
  scope: string;
  /** Resource label used to build default messages (`<resource> not found`). */
  resource: string;
  context?: Record<string, unknown>;
  messages?: Partial<TibiaDataErrorMessages>;
}

function resolveErrorMessages(options: TibiaDataErrorOptions): TibiaDataErrorMessages {
  return {
    notFound: options.messages?.notFound ?? `${options.resource} not found`,
    loadFailed: options.messages?.loadFailed ?? `Could not load ${options.resource.toLowerCase()}`,
  };
}

export async function authorizeTibiaRequest(request: NextRequest): Promise<NextResponse | null> {
  const auth = await requireAuth(request);
  return isAuthDenied(auth) ? auth.response : null;
}

export function tibiaDataErrorResponse(
  error: unknown,
  options: TibiaDataErrorOptions,
): NextResponse {
  const messages = resolveErrorMessages(options);

  if (error instanceof TibiaDataNotFoundError) {
    return errorResponse(messages.notFound, HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  logError(options.scope, ErrorCode.INTERNAL_ERROR, options.context, error);
  return errorResponse(messages.loadFailed, HttpStatus.BAD_GATEWAY, ErrorCode.INTERNAL_ERROR);
}

export async function respondWithTibiaData<T>(
  load: () => Promise<T>,
  options: TibiaDataErrorOptions,
): Promise<NextResponse> {
  try {
    const data = await load();
    return NextResponse.json<ApiResponse<T>>({ data });
  } catch (error) {
    return tibiaDataErrorResponse(error, options);
  }
}

/** Auth guard + load + `{ data }` envelope + TibiaData error mapping for parameterless GETs. */
export async function handleTibiaDataGet<T>(
  request: NextRequest,
  load: () => Promise<T>,
  options: TibiaDataErrorOptions,
): Promise<NextResponse> {
  const denied = await authorizeTibiaRequest(request);
  if (denied) {
    return denied;
  }

  return respondWithTibiaData(load, options);
}
