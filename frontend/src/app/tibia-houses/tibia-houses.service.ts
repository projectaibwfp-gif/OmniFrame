import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { TibiaHouseDto, TibiaHousesOverviewDto } from '@shared/api-contract';
import { getApiData } from '../config/api-data';

@Injectable({ providedIn: 'root' })
export class TibiaHousesService {
  private readonly http = inject(HttpClient);

  getHouses(world: string, town: string): Observable<TibiaHousesOverviewDto> {
    return getApiData(
      this.http,
      `/houses/${encodeURIComponent(world)}/${encodeURIComponent(town)}`,
    );
  }

  getHouse(world: string, houseId: number): Observable<TibiaHouseDto> {
    return getApiData(this.http, `/house/${encodeURIComponent(world)}/${houseId}`);
  }
}
