import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { TibiaHouseDto, TibiaHousesOverviewDto } from '@shared/api-contract';
import { buildApiUrl } from '../config/api.config';

type HousesResponse = {
  data: TibiaHousesOverviewDto;
};

type HouseResponse = {
  data: TibiaHouseDto;
};

@Injectable({ providedIn: 'root' })
export class TibiaHousesService {
  private readonly http = inject(HttpClient);

  getHouses(world: string, town: string): Observable<TibiaHousesOverviewDto> {
    return this.http
      .get<HousesResponse>(
        buildApiUrl(`/houses/${encodeURIComponent(world)}/${encodeURIComponent(town)}`),
      )
      .pipe(map((response) => response.data));
  }

  getHouse(world: string, houseId: number): Observable<TibiaHouseDto> {
    return this.http
      .get<HouseResponse>(buildApiUrl(`/house/${encodeURIComponent(world)}/${houseId}`))
      .pipe(map((response) => response.data));
  }
}
