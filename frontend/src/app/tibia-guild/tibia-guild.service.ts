import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { TibiaGuildDto } from '@shared/api-contract';
import { buildApiUrl } from '../config/api.config';

type GuildResponse = {
  data: TibiaGuildDto;
};

@Injectable({ providedIn: 'root' })
export class TibiaGuildService {
  private readonly http = inject(HttpClient);

  getGuild(name: string): Observable<TibiaGuildDto> {
    return this.http
      .get<GuildResponse>(buildApiUrl(`/guild/${encodeURIComponent(name)}`))
      .pipe(map((response) => response.data));
  }
}
