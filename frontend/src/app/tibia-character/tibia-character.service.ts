import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type {
  ApiResponse,
  TibiaCharacterLookupDto,
  HighscoresSnapshotRecordDto,
} from '@shared/api-contract';
import { buildApiUrl } from '../config/api.config';

type CharacterResponse = ApiResponse<TibiaCharacterLookupDto>;
type HighscoresHistoryResponse = ApiResponse<{
  data: HighscoresSnapshotRecordDto[];
  total: number;
}>;

@Injectable({ providedIn: 'root' })
export class TibiaCharacterService {
  private readonly http = inject(HttpClient);

  getCharacter(name: string): Observable<TibiaCharacterLookupDto> {
    const normalizedName = name.trim();
    return this.http
      .get<CharacterResponse>(buildApiUrl(`/character/${encodeURIComponent(normalizedName)}`))
      .pipe(map((response) => response.data));
  }

  getHighscoresHistory(name: string): Observable<{
    data: HighscoresSnapshotRecordDto[];
    total: number;
  }> {
    const normalizedName = name.trim();
    return this.http
      .get<HighscoresHistoryResponse>(
        buildApiUrl(`/character/${encodeURIComponent(normalizedName)}/highscores-history`),
      )
      .pipe(map((response) => response.data));
  }
}
