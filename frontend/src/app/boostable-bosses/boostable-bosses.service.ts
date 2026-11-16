import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  BoostableBossesDto,
  CharacterProgressListDto,
  CharacterProgressStatus,
  CharacterProgressTargetKind,
  CharacterProgressUpdateRequestDto,
  CharacterProgressUpdateResponseDto,
  TibiaCreaturesDto,
} from '@shared/api-contract';
import { ApiClient } from '../core/api/api-client';

const CHARACTER_PROGRESS_PATH = '/auth/me/character-progress';

@Injectable({ providedIn: 'root' })
export class BoostableBossesService {
  private readonly apiClient = inject(ApiClient);

  getBoostableBosses(): Observable<BoostableBossesDto> {
    return this.apiClient.get('/boostable-bosses');
  }

  getCreatures(): Observable<TibiaCreaturesDto> {
    return this.apiClient.get('/creatures');
  }

  getCharacterProgress(): Observable<CharacterProgressListDto> {
    return this.apiClient.get(CHARACTER_PROGRESS_PATH);
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

    return this.apiClient.put(CHARACTER_PROGRESS_PATH, payload);
  }
}
