import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { TibiaSpellDetailsDto, TibiaSpellsOverviewDto } from '@shared/api-contract';
import { buildApiUrl } from '../config/api.config';

type SpellsResponse = {
  data: TibiaSpellsOverviewDto;
};

type SpellResponse = {
  data: TibiaSpellDetailsDto;
};

@Injectable({ providedIn: 'root' })
export class TibiaSpellsService {
  private readonly http = inject(HttpClient);

  getSpells(): Observable<TibiaSpellsOverviewDto> {
    return this.http
      .get<SpellsResponse>(buildApiUrl('/spells'))
      .pipe(map((response) => response.data));
  }

  getSpell(spellId: string): Observable<TibiaSpellDetailsDto> {
    return this.http
      .get<SpellResponse>(buildApiUrl(`/spell/${encodeURIComponent(spellId)}`))
      .pipe(map((response) => response.data));
  }
}
