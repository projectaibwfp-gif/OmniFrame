import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { TibiaFansitesDto } from '@shared/api-contract';
import { buildApiUrl } from '../config/api.config';

type FansitesResponse = {
  data: TibiaFansitesDto;
};

@Injectable({ providedIn: 'root' })
export class TibiaFansitesService {
  private readonly http = inject(HttpClient);

  getFansites(): Observable<TibiaFansitesDto> {
    return this.http
      .get<FansitesResponse>(buildApiUrl('/fansites'))
      .pipe(map((response) => response.data));
  }
}
