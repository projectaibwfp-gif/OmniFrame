import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { TibiaGuildDto } from '@shared/api-contract';
import { ApiClient } from '../core/api/api-client';

@Injectable({ providedIn: 'root' })
export class TibiaGuildService {
  private readonly apiClient = inject(ApiClient);

  getGuild(name: string): Observable<TibiaGuildDto> {
    return this.apiClient.get(`/guild/${encodeURIComponent(name)}`);
  }
}
