import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { TibiaWorldDto, TibiaWorldsOverviewDto } from '@shared/api-contract';
import { buildApiUrl } from '../config/api.config';

type WorldsResponse = {
  data: TibiaWorldsOverviewDto;
};

type WorldResponse = {
  data: TibiaWorldDto;
};

@Injectable({ providedIn: 'root' })
export class TibiaWorldsService {
  private readonly http = inject(HttpClient);

  getWorlds(): Observable<TibiaWorldsOverviewDto> {
    return this.http
      .get<WorldsResponse>(buildApiUrl('/worlds'))
      .pipe(map((response) => response.data));
  }

  getWorld(name: string): Observable<TibiaWorldDto> {
    return this.http
      .get<WorldResponse>(buildApiUrl(`/world/${encodeURIComponent(name)}`))
      .pipe(map((response) => response.data));
  }
}
