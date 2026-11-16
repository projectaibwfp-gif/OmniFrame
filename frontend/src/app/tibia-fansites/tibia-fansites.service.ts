import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { TibiaFansitesDto } from '@shared/api-contract';
import { ApiClient } from '../core/api/api-client';

@Injectable({ providedIn: 'root' })
export class TibiaFansitesService {
  private readonly apiClient = inject(ApiClient);

  getFansites(): Observable<TibiaFansitesDto> {
    return this.apiClient.get('/fansites');
  }
}
