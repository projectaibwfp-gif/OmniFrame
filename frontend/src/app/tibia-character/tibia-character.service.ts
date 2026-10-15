import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { TibiaCharacterLookupDto, HighscoresSnapshotRecordDto } from '@shared/api-contract';
import { getApiData } from '../config/api-data';

interface HighscoresHistory {
  data: HighscoresSnapshotRecordDto[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class TibiaCharacterService {
  private readonly http = inject(HttpClient);

  getCharacter(name: string): Observable<TibiaCharacterLookupDto> {
    const normalizedName = name.trim();
    return getApiData(this.http, `/character/${encodeURIComponent(normalizedName)}`);
  }

  getHighscoresHistory(name: string): Observable<HighscoresHistory> {
    const normalizedName = name.trim();
    return getApiData(
      this.http,
      `/character/${encodeURIComponent(normalizedName)}/highscores-history`,
    );
  }
}
