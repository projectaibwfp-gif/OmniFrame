import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type {
  ApiResponse,
  AuthCurrentUserResponseDto,
  LinkMainCharacterRequestDto,
  TibiaCharacterDto,
  UserMainCharacterDto,
} from '@shared/api-contract';
import { AuthService } from '../auth/auth.service';
import { buildApiUrl } from '../config/api.config';
import { formatMainCharacterBadge, shortVocation } from '../core/vocation';

type LinkResponse = ApiResponse<AuthCurrentUserResponseDto>;

const MAIN_CHARACTER_ENDPOINT = '/auth/me/main-character';
const MAIN_CHARACTER_REFRESH_ENDPOINT = '/auth/me/main-character/refresh';

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
  private freshCharacterName: string | null = null;

  constructor() {
    // Keyed on the name, not the character object: a refresh writes a new
    // object back to `AuthService.user`, so tracking the object loops forever.
    effect(() => {
      const name = this.name();
      untracked(() => void this.refreshOncePerCharacter(name));
    });
  }

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
      this.http.put<LinkResponse>(buildApiUrl(MAIN_CHARACTER_ENDPOINT), payload),
    );
    this.freshCharacterName = response.data.user.mainCharacter?.name ?? null;
    this.authService.setUserFromApi(response.data.user);
  }

  async unlink(): Promise<void> {
    const response = await firstValueFrom(
      this.http.delete<LinkResponse>(buildApiUrl(MAIN_CHARACTER_ENDPOINT)),
    );
    this.authService.setUserFromApi(response.data.user);
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

  private async refreshOncePerCharacter(name: string | null): Promise<void> {
    if (!name || name === this.freshCharacterName) {
      return;
    }

    this.freshCharacterName = name;
    try {
      const response = await firstValueFrom(
        this.http.put<LinkResponse>(buildApiUrl(MAIN_CHARACTER_REFRESH_ENDPOINT), {}),
      );
      this.freshCharacterName = response.data.user.mainCharacter?.name ?? null;
      this.authService.setUserFromApi(response.data.user);
    } catch (error) {
      console.warn('Failed to refresh main character from TibiaData', error);
    }
  }
}
