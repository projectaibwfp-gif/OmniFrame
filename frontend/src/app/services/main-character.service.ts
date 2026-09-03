import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type {
  ApiResponse,
  AuthCurrentUserResponseDto,
  LinkMainCharacterRequestDto,
  TibiaCharacterDto,
  UserMainCharacterDto,
} from '@shared/api-contract';
import { AuthService } from '../auth/auth.service';
import { mapAuthUser } from '../auth/auth-user.mapper';
import { buildApiUrl } from '../config/api.config';
import { formatMainCharacterBadge, shortVocation } from '../core/vocation';

type LinkResponse = ApiResponse<AuthCurrentUserResponseDto>;

/**
 * Owner of the "main character" feature: HTTP calls against
 * `/auth/me/main-character` and reactive read-only view of the linked character.
 *
 * The linked character lives inside `AuthService.user`, because backend returns
 * a full `AuthCurrentUserDto` on every link/unlink. This service reads that
 * signal for its state and only writes it back after successful mutations, so
 * there is a single source of truth.
 */
@Injectable({ providedIn: 'root' })
export class MainCharacterService {
  readonly character = computed<UserMainCharacterDto | null>(
    () => this.authService.user()?.mainCharacter ?? null,
  );

  readonly isLinked = computed(() => this.character() !== null);
  readonly name = computed(() => this.character()?.name ?? null);
  readonly world = computed(() => this.character()?.world ?? null);
  readonly vocation = computed(() => this.character()?.vocation ?? null);
  readonly level = computed(() => this.character()?.level ?? null);
  readonly linkedAt = computed(() => this.character()?.linkedAt ?? null);
  readonly vocationShort = computed(() => shortVocation(this.vocation()));

  readonly badge = computed(() => {
    const character = this.character();
    if (!character) {
      return '';
    }
    return formatMainCharacterBadge(character.vocation, character.level);
  });

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  isCurrentMain(candidateName: string | null | undefined): boolean {
    const current = this.name();
    if (!current || !candidateName) {
      return false;
    }
    return current.toLowerCase() === candidateName.trim().toLowerCase();
  }

  async link(name: string): Promise<void> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Character name is required');
    }

    const payload: LinkMainCharacterRequestDto = { name: trimmedName };
    const response = await firstValueFrom(
      this.http.put<LinkResponse>(buildApiUrl('/auth/me/main-character'), payload),
    );
    this.authService.user.set(mapAuthUser(response.data.user));
  }

  async unlink(): Promise<void> {
    const response = await firstValueFrom(
      this.http.delete<LinkResponse>(buildApiUrl('/auth/me/main-character')),
    );
    this.authService.user.set(mapAuthUser(response.data.user));
  }

  refreshCurrentUserMainCharacter(character: TibiaCharacterDto): void {
    const currentUser = this.authService.user();
    if (!currentUser?.mainCharacter) {
      return;
    }

    this.authService.user.set({
      ...currentUser,
      mainCharacter: {
        ...currentUser.mainCharacter,
        level: character.level,
        vocation: character.vocation,
        world: character.world,
      },
    });
  }
}
