import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { TibiaHouseDto, TibiaHousesOverviewDto } from '@shared/api-contract';
import { ApiClient } from '../core/api/api-client';

@Injectable({ providedIn: 'root' })
export class TibiaHousesService {
  private readonly apiClient = inject(ApiClient);

  getHouses(world: string, town: string): Observable<TibiaHousesOverviewDto> {
    return this.apiClient.get(`/houses/${encodeURIComponent(world)}/${encodeURIComponent(town)}`);
  }

  getHouse(world: string, houseId: number): Observable<TibiaHouseDto> {
    return this.apiClient.get(`/house/${encodeURIComponent(world)}/${houseId}`);
  }
}
