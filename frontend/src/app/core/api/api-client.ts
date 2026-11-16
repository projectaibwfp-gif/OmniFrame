import {
  HttpClient,
  HttpErrorResponse,
  type HttpContext,
  type HttpParams,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, throwError, type Observable } from 'rxjs';
import type { ApiResponse } from '@shared/api-contract';
import { buildApiUrl } from '../../config/api.config';
import { toApiError } from '../http-error';

const HttpMethod = {
  Get: 'GET',
  Post: 'POST',
  Put: 'PUT',
  Patch: 'PATCH',
  Delete: 'DELETE',
} as const;

type HttpMethodName = (typeof HttpMethod)[keyof typeof HttpMethod];

export interface ApiRequestOptions {
  params?: HttpParams;
  context?: HttpContext;
  /**
   * Most endpoints wrap the payload in `ApiResponse<T>`; a few (for example
   * `/highscores-snapshots`) return the DTO as the whole body.
   */
  unwrapData?: boolean;
}

/**
 * HTTP failures are rethrown as `ApiError` only after `HttpClient`, so the
 * interceptors (credentials, auth refresh, global error) still see the raw
 * `HttpErrorResponse`.
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);

  get<T>(path: string, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>(HttpMethod.Get, path, options);
  }

  post<T>(path: string, body: unknown, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>(HttpMethod.Post, path, options, body);
  }

  put<T>(path: string, body: unknown, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>(HttpMethod.Put, path, options, body);
  }

  patch<T>(path: string, body: unknown, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>(HttpMethod.Patch, path, options, body);
  }

  delete<T>(path: string, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>(HttpMethod.Delete, path, options);
  }

  private request<T>(
    method: HttpMethodName,
    path: string,
    options: ApiRequestOptions,
    body?: unknown,
  ): Observable<T> {
    const { unwrapData = true, params, context } = options;

    return this.http
      .request<ApiResponse<T> | T>(method, buildApiUrl(path), { body, params, context })
      .pipe(
        map((response) => (unwrapData ? (response as ApiResponse<T>).data : (response as T))),
        catchError((error: unknown) => throwError(() => mapHttpError(error))),
      );
  }
}

function mapHttpError(error: unknown): unknown {
  return error instanceof HttpErrorResponse ? toApiError(error) : error;
}
