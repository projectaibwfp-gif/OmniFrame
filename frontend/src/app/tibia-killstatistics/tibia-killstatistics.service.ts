import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { TibiaKillStatisticsWorldDto } from '@shared/api-contract';
import { ApiClient } from '../core/api/api-client';

@Injectable({ providedIn: 'root' })
export class TibiaKillStatisticsService {
  private readonly apiClient = inject(ApiClient);

  getKillStatistics(world: string): Observable<TibiaKillStatisticsWorldDto> {
    return this.apiClient.get(`/killstatistics/${encodeURIComponent(world)}`);
  }
}
