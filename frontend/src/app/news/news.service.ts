import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { ApiResponse, TibiaNewsListDto } from '@shared/api-contract';
import { buildApiUrl } from '../config/api.config';

type NewsResponse = ApiResponse<TibiaNewsListDto>;

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly http = inject(HttpClient);

  getNews(): Observable<TibiaNewsListDto> {
    return this.http.get<NewsResponse>(buildApiUrl('/news')).pipe(map((response) => response.data));
  }
}
