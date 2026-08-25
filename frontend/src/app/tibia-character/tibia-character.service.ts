import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { ApiResponse, TibiaCharacterLookupDto } from '@shared/api-contract';
import { buildApiUrl } from '../config/api.config';

type CharacterResponse = ApiResponse<TibiaCharacterLookupDto>;

@Injectable({ providedIn: 'root' })
export class TibiaCharacterService {
  private readonly http = inject(HttpClient);

  getCharacter(name: string): Observable<TibiaCharacterLookupDto> {
    const normalizedName = name.trim();
    return this.http
      .get<CharacterResponse>(buildApiUrl(`/character/${encodeURIComponent(normalizedName)}`))
      .pipe(map((response) => response.data));
  }
}
