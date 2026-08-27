import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { TibiaKillStatisticsWorldDto } from '@shared/api-contract';
import { buildApiUrl } from '../config/api.config';

type KillStatisticsResponse = {
  data: TibiaKillStatisticsWorldDto;
};

@Injectable({ providedIn: 'root' })
export class TibiaKillStatisticsService {
  private readonly http = inject(HttpClient);

  getKillStatistics(world: string): Observable<TibiaKillStatisticsWorldDto> {
    return this.http
      .get<KillStatisticsResponse>(
        buildApiUrl(`/tibia/killstatistics/${encodeURIComponent(world)}`),
      )
      .pipe(map((response) => response.data));
  }
}
