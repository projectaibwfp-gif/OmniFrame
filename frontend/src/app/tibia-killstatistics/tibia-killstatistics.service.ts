import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { TibiaKillStatisticsWorldDto } from '@shared/api-contract';
import { getApiData } from '../config/api-data';

@Injectable({ providedIn: 'root' })
export class TibiaKillStatisticsService {
  private readonly http = inject(HttpClient);

  getKillStatistics(world: string): Observable<TibiaKillStatisticsWorldDto> {
    return getApiData(this.http, `/killstatistics/${encodeURIComponent(world)}`);
  }
}
