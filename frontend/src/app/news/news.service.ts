import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { TibiaNewsListDto } from '@shared/api-contract';
import { ApiClient } from '../core/api/api-client';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly apiClient = inject(ApiClient);

  getNews(): Observable<TibiaNewsListDto> {
    return this.apiClient.get('/news');
  }
}
