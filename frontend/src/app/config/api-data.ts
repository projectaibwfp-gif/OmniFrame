import type { HttpClient, HttpParams } from '@angular/common/http';
import { map, type Observable } from 'rxjs';
import type { ApiResponse } from '@shared/api-contract';
import { buildApiUrl } from './api.config';

export interface ApiDataRequestOptions {
  params?: HttpParams;
}

export function unwrapApiData<T>(response: ApiResponse<T>): T {
  return response.data;
}

export function getApiData<T>(
  http: HttpClient,
  path: string,
  options: ApiDataRequestOptions = {},
): Observable<T> {
  return http.get<ApiResponse<T>>(buildApiUrl(path), options).pipe(map(unwrapApiData));
}
