import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { TibiaGuildDto } from '@shared/api-contract';
import { getApiData } from '../config/api-data';

@Injectable({ providedIn: 'root' })
export class TibiaGuildService {
  private readonly http = inject(HttpClient);

  getGuild(name: string): Observable<TibiaGuildDto> {
    return getApiData(this.http, `/guild/${encodeURIComponent(name)}`);
  }
}
