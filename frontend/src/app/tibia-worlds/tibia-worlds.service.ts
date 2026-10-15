import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { TibiaWorldDto, TibiaWorldsOverviewDto } from '@shared/api-contract';
import { getApiData } from '../config/api-data';

@Injectable({ providedIn: 'root' })
export class TibiaWorldsService {
  private readonly http = inject(HttpClient);

  getWorlds(): Observable<TibiaWorldsOverviewDto> {
    return getApiData(this.http, '/worlds');
  }

  getWorld(name: string): Observable<TibiaWorldDto> {
    return getApiData(this.http, `/world/${encodeURIComponent(name)}`);
  }
}
