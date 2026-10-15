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
import { getApiData, unwrapApiData } from '../config/api-data';
import { buildApiUrl } from '../config/api.config';

const CHARACTER_PROGRESS_PATH = '/auth/me/character-progress';

@Injectable({ providedIn: 'root' })
export class BoostableBossesService {
  private readonly http = inject(HttpClient);

  getBoostableBosses(): Observable<BoostableBossesDto> {
    return getApiData(this.http, '/boostable-bosses');
  }

  getCreatures(): Observable<TibiaCreaturesDto> {
    return getApiData(this.http, '/creatures');
  }

  getCharacterProgress(): Observable<CharacterProgressListDto> {
    return getApiData(this.http, CHARACTER_PROGRESS_PATH);
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
      .put<ApiResponse<CharacterProgressUpdateResponseDto>>(
        buildApiUrl(CHARACTER_PROGRESS_PATH),
        payload,
      )
      .pipe(map(unwrapApiData));
  }
}
