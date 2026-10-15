import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { TibiaNewsListDto } from '@shared/api-contract';
import { getApiData } from '../config/api-data';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly http = inject(HttpClient);

  getNews(): Observable<TibiaNewsListDto> {
    return getApiData(this.http, '/news');
  }
}
