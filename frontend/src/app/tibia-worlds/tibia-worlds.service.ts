import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { TibiaWorldDto, TibiaWorldsOverviewDto } from '@shared/api-contract';
import { ApiClient } from '../core/api/api-client';

@Injectable({ providedIn: 'root' })
export class TibiaWorldsService {
  private readonly apiClient = inject(ApiClient);

  getWorlds(): Observable<TibiaWorldsOverviewDto> {
    return this.apiClient.get('/worlds');
  }

  getWorld(name: string): Observable<TibiaWorldDto> {
    return this.apiClient.get(`/world/${encodeURIComponent(name)}`);
  }
}
