import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { ApiResponse, BoostableBossesDto, TibiaCreaturesDto } from '@shared/api-contract';
import { buildApiUrl } from '../config/api.config';

type BoostableBossesResponse = ApiResponse<BoostableBossesDto>;
type CreaturesResponse = ApiResponse<TibiaCreaturesDto>;

@Injectable({ providedIn: 'root' })
export class BoostableBossesService {
  private readonly http = inject(HttpClient);

  getBoostableBosses(): Observable<BoostableBossesDto> {
    return this.http
      .get<BoostableBossesResponse>(buildApiUrl('/boostable-bosses'))
      .pipe(map((response) => response.data));
  }

  getCreatures(): Observable<TibiaCreaturesDto> {
    return this.http
      .get<CreaturesResponse>(buildApiUrl('/creatures'))
      .pipe(map((response) => response.data));
  }
}
