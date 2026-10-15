import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { TibiaSpellDetailsDto, TibiaSpellsOverviewDto } from '@shared/api-contract';
import { getApiData } from '../config/api-data';

@Injectable({ providedIn: 'root' })
export class TibiaSpellsService {
  private readonly http = inject(HttpClient);

  getSpells(): Observable<TibiaSpellsOverviewDto> {
    return getApiData(this.http, '/spells');
  }

  getSpell(spellId: string): Observable<TibiaSpellDetailsDto> {
    return getApiData(this.http, `/spell/${encodeURIComponent(spellId)}`);
  }
}
