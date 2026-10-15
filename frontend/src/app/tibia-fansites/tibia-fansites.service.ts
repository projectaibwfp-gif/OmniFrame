import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { TibiaFansitesDto } from '@shared/api-contract';
import { getApiData } from '../config/api-data';

@Injectable({ providedIn: 'root' })
export class TibiaFansitesService {
  private readonly http = inject(HttpClient);

  getFansites(): Observable<TibiaFansitesDto> {
    return getApiData(this.http, '/fansites');
  }
}
