import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { TibiaSpellDetailsDto, TibiaSpellsOverviewDto } from '@shared/api-contract';
import { ApiClient } from '../core/api/api-client';

@Injectable({ providedIn: 'root' })
export class TibiaSpellsService {
  private readonly apiClient = inject(ApiClient);

  getSpells(): Observable<TibiaSpellsOverviewDto> {
    return this.apiClient.get('/spells');
  }

  getSpell(spellId: string): Observable<TibiaSpellDetailsDto> {
    return this.apiClient.get(`/spell/${encodeURIComponent(spellId)}`);
  }
}
