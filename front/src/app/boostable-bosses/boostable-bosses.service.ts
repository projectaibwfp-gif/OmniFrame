import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { ApiResponse, BoostableBossesDto } from '@shared/api-contract';
import { buildApiUrl } from '../config/api.config';

type BoostableBossesResponse = ApiResponse<BoostableBossesDto>;

@Injectable({ providedIn: 'root' })
export class BoostableBossesService {
  private readonly http = inject(HttpClient);

  getBoostableBosses(): Observable<BoostableBossesDto> {
    return this.http
      .get<BoostableBossesResponse>(buildApiUrl('/boostable-bosses'))
      .pipe(map((response) => response.data));
  }
}
