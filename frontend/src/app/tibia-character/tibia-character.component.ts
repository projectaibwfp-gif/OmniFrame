import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import type { TibiaCharacterExperienceDto, TibiaCharacterLookupDto } from '@shared/api-contract';
import { AppDateTimePipe } from '../core/date-time.pipe';
import { AuthService } from '../auth/auth.service';
import { MainCharacterService } from '../services/main-character.service';
import { TibiaCharacterService } from './tibia-character.service';

const MAIN_CHARACTER_LINK_ERROR = 'Nie udało się powiązać postaci. Spróbuj ponownie.';

@Component({
  selector: 'app-tibia-character',
  imports: [FormsModule, AppDateTimePipe],
  templateUrl: './tibia-character.component.html',
  styleUrl: './tibia-character.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TibiaCharacterComponent {
  protected readonly currentUser = inject(AuthService).user;
  protected readonly characterName = signal('');
  protected readonly lookup = signal<TibiaCharacterLookupDto | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly apiError = signal<string | null>(null);
  protected readonly recentCharacterNames = signal<string[]>([]);
  protected readonly isLinkingMainCharacter = signal(false);
  protected readonly linkMainCharacterError = signal<string | null>(null);
  protected readonly linkMainCharacterSuccess = signal(false);
  protected readonly isHistoryExpanded = signal(false);

  protected readonly character = computed(() => this.lookup()?.character ?? null);
  protected readonly history = computed(() => this.lookup()?.history ?? []);
  protected readonly achievements = computed(() => this.character()?.achievements ?? []);
  protected readonly otherCharacters = computed(() => this.character()?.otherCharacters ?? []);
  protected readonly experience = computed(() => this.character()?.experience ?? null);
  protected readonly experienceLookupLog = computed(() => this.experience()?.lookupLog ?? null);
  protected readonly mainCharacter = computed(() => this.mainCharacterService.character());
  protected readonly mainCharacterBadge = computed(() => this.mainCharacterService.badge());
  protected readonly isCurrentMain = computed(() =>
    this.mainCharacterService.isCurrentMain(this.character()?.name),
  );

  private readonly tibiaCharacterService = inject(TibiaCharacterService);
  private readonly mainCharacterService = inject(MainCharacterService);
  private readonly destroyRef = inject(DestroyRef);

  protected setCharacterName(value: string): void {
    this.characterName.set(value);
  }

  protected toggleHistory(): void {
    this.isHistoryExpanded.update((value) => !value);
  }

  protected getExperienceStatusLabel(experience: TibiaCharacterExperienceDto): string {
    if (experience.status === 'found') {
      return 'Dokładny EXP z highscores';
    }

    if (experience.status === 'outside_top1000') {
      return 'Postać poza top 1000 highscores';
    }

    return 'Nie można potwierdzić EXP per profesja (ograniczenie TibiaData)';
  }

  protected loadCharacter(): void {
    const name = this.characterName().trim();
    if (!name) {
      this.lookup.set(null);
      this.apiError.set('Podaj nazwę postaci.');
      return;
    }

    this.loadCharacterByName(name);
  }

  protected repeatLookup(name: string): void {
    const normalizedName = name.trim();
    if (!normalizedName) {
      return;
    }

    this.characterName.set(normalizedName);
    this.loadCharacterByName(normalizedName);
  }

  protected setAsMainCharacter(): void {
    const character = this.character();
    if (!character) {
      return;
    }

    this.isLinkingMainCharacter.set(true);
    this.linkMainCharacterError.set(null);
    this.linkMainCharacterSuccess.set(false);

    this.mainCharacterService
      .link(character.name)
      .then(() => {
        this.linkMainCharacterSuccess.set(true);
      })
      .catch((error: unknown) => {
        console.error('Failed to link main character:', error);
        const message =
          typeof error === 'object' && error !== null && 'error' in error
            ? (error as { error?: { message?: string } }).error?.message
            : undefined;
        this.linkMainCharacterError.set(message || MAIN_CHARACTER_LINK_ERROR);
      })
      .finally(() => {
        this.isLinkingMainCharacter.set(false);
      });
  }

  private loadCharacterByName(name: string): void {
    this.isLoading.set(true);
    this.lookup.set(null);
    this.apiError.set(null);
    this.linkMainCharacterError.set(null);
    this.linkMainCharacterSuccess.set(false);

    this.tibiaCharacterService
      .getCharacter(name)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.pushRecentCharacterName(name);
          this.lookup.set(response);
        },
        error: (error) => {
          if (error?.status === 404) {
            this.apiError.set(`Nie znaleziono postaci "${name}".`);
            return;
          }

          this.apiError.set('Nie udało się pobrać danych postaci. Spróbuj ponownie.');
        },
      });
  }

  private pushRecentCharacterName(name: string): void {
    this.recentCharacterNames.update((current) => {
      const existingWithoutCurrent = current.filter(
        (currentName) => currentName.toLowerCase() !== name.toLowerCase(),
      );
      return [name, ...existingWithoutCurrent].slice(0, 12);
    });
  }
}
