import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type {
  ApiResponse,
  BoostableBossesDto,
  CharacterProgressListDto,
  CharacterProgressStatus,
  CharacterProgressTargetKind,
  CharacterProgressUpdateRequestDto,
  CharacterProgressUpdateResponseDto,
  TibiaCreaturesDto,
} from '@shared/api-contract';
import { buildApiUrl } from '../config/api.config';

type BoostableBossesResponse = ApiResponse<BoostableBossesDto>;
type CreaturesResponse = ApiResponse<TibiaCreaturesDto>;
type CharacterProgressListResponse = ApiResponse<CharacterProgressListDto>;
type CharacterProgressUpdateResponse = ApiResponse<CharacterProgressUpdateResponseDto>;

@Injectable({ providedIn: 'root' })
export class BoostableBossesService {
  private readonly http = inject(HttpClient);

  getBoostableBosses(): Observable<BoostableBossesDto> {
    return this.http
      .get<BoostableBossesResponse>(buildApiUrl('/boostable-bosses'))
      .pipe(map((response) => response.data));
  }

  getCreatures(): Observable<TibiaCreaturesDto> {
    return this.http
      .get<CreaturesResponse>(buildApiUrl('/creatures'))
      .pipe(map((response) => response.data));
  }

  getCharacterProgress(): Observable<CharacterProgressListDto> {
    return this.http
      .get<CharacterProgressListResponse>(buildApiUrl('/auth/me/character-progress'))
      .pipe(map((response) => response.data));
  }

  updateCharacterProgress(
    targetKind: CharacterProgressTargetKind,
    targetName: string,
    status: CharacterProgressStatus,
  ): Observable<CharacterProgressUpdateResponseDto> {
    const payload: CharacterProgressUpdateRequestDto = {
      targetKind,
      targetName,
      status,
    };

    return this.http
      .put<CharacterProgressUpdateResponse>(buildApiUrl('/auth/me/character-progress'), payload)
      .pipe(map((response) => response.data));
  }
}
