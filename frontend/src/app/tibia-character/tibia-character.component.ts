import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { HttpStatusCode } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { TibiaCharacterDto, TibiaCharacterExperienceDto } from '@shared/api-contract';
import { AppDateTimePipe } from '../core/date-time.pipe';
import { extractApiErrorMessage, isHttpErrorStatus } from '../core/http-error';
import { AppNumberPipe } from '../core/number-format.pipe';
import { resourceValueOr } from '../core/resource-value';
import { MainCharacterService } from '../services/main-character.service';
import { TibiaCharacterService } from './tibia-character.service';

const MAX_RECENT_CHARACTER_NAMES = 12;
const CHARACTER_NAME_REQUIRED = 'Podaj nazwę postaci.';
const CHARACTER_LOOKUP_ERROR = 'Nie udało się pobrać danych postaci. Spróbuj ponownie.';
const MAIN_CHARACTER_LINK_ERROR = 'Nie udało się powiązać postaci. Spróbuj ponownie.';

@Component({
  selector: 'app-tibia-character',
  imports: [FormsModule, AppDateTimePipe, AppNumberPipe, RouterLink],
  templateUrl: './tibia-character.component.html',
  styleUrl: './tibia-character.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TibiaCharacterComponent {
  /** `?name=` bound by `withComponentInputBinding()` - the URL drives the lookup. */
  readonly name = input<string>();

  protected readonly character = computed(() => this.lookup()?.character ?? null);
  protected readonly achievements = computed(() => this.character()?.achievements ?? []);
  protected readonly otherCharacters = computed(() => this.character()?.otherCharacters ?? []);
  protected readonly experience = computed(() => this.character()?.experience ?? null);
  protected readonly experienceLookupLog = computed(() => this.experience()?.lookupLog ?? null);
  protected readonly isLoading = computed(() => this.lookupResource.isLoading());
  protected readonly apiError = computed(() => this.validationError() ?? this.lookupErrorMessage());

  protected readonly characterName = linkedSignal(() => this.requestedName());
  protected readonly recentCharacterNames = signal<string[]>([]);

  protected readonly mainCharacter = computed(() => this.mainCharacterService.character());
  protected readonly isCurrentMain = computed(() =>
    this.mainCharacterService.isCurrentMain(this.character()?.name),
  );
  protected readonly isRefreshingMainCharacter = computed(
    () => this.isLoading() && this.mainCharacterService.isCurrentMain(this.requestedName()),
  );
  protected readonly isLinkingMainCharacter = signal(false);
  protected readonly linkMainCharacterError = linkedSignal<string, string | null>({
    source: () => this.requestedName(),
    computation: () => null,
  });
  protected readonly linkMainCharacterSuccess = linkedSignal({
    source: () => this.requestedName(),
    computation: () => false,
  });

  protected readonly isHighscoresHistoryExpanded = signal(false);
  protected readonly highscoresHistory = computed(() => this.highscoresHistoryPage()?.data ?? []);

  private readonly tibiaCharacterService = inject(TibiaCharacterService);
  private readonly mainCharacterService = inject(MainCharacterService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly requestedName = computed(() => this.name()?.trim() ?? '');
  private readonly validationError = linkedSignal<string, string | null>({
    source: () => this.requestedName(),
    computation: () => null,
  });

  private readonly lookupResource = rxResource({
    params: () => this.requestedName() || undefined,
    stream: ({ params }) => this.tibiaCharacterService.getCharacter(params),
  });
  private readonly lookup = resourceValueOr(this.lookupResource, null);

  private readonly highscoresHistoryRequested = linkedSignal({
    source: () => this.character()?.name,
    computation: () => false,
  });
  private readonly highscoresHistoryResource = rxResource({
    params: () => (this.highscoresHistoryRequested() ? this.character()?.name : undefined),
    stream: ({ params }) => this.tibiaCharacterService.getHighscoresHistory(params),
  });
  private readonly highscoresHistoryPage = resourceValueOr(this.highscoresHistoryResource, null);

  constructor() {
    effect(() => {
      const character = this.character();
      if (character) {
        untracked(() => this.rememberLookup(character));
      }
    });
  }

  protected setCharacterName(value: string): void {
    this.characterName.set(value);
  }

  protected loadCharacter(): void {
    const name = this.characterName().trim();
    if (!name) {
      this.validationError.set(CHARACTER_NAME_REQUIRED);
      return;
    }

    this.showCharacter(name);
  }

  protected repeatLookup(name: string): void {
    const normalizedName = name.trim();
    if (normalizedName) {
      this.showCharacter(normalizedName);
    }
  }

  protected refreshMainCharacter(): void {
    const mainCharacterName = this.mainCharacter()?.name?.trim();
    if (mainCharacterName && !this.isLoading()) {
      this.showCharacter(mainCharacterName);
    }
  }

  protected toggleHighscoresHistory(): void {
    this.isHighscoresHistoryExpanded.update((value) => !value);
    if (this.isHighscoresHistoryExpanded()) {
      this.highscoresHistoryRequested.set(true);
    }
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

  protected async setAsMainCharacter(): Promise<void> {
    const character = this.character();
    if (!character) {
      return;
    }

    this.isLinkingMainCharacter.set(true);
    this.linkMainCharacterError.set(null);
    this.linkMainCharacterSuccess.set(false);

    try {
      await this.mainCharacterService.link(character.name);
      this.linkMainCharacterSuccess.set(true);
    } catch (error) {
      this.linkMainCharacterError.set(extractApiErrorMessage(error, MAIN_CHARACTER_LINK_ERROR));
    } finally {
      this.isLinkingMainCharacter.set(false);
    }
  }

  private showCharacter(name: string): void {
    this.validationError.set(null);
    this.characterName.set(name);

    if (name === this.requestedName()) {
      this.lookupResource.reload();
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { name },
      queryParamsHandling: 'merge',
    });
  }

  private lookupErrorMessage(): string | null {
    const error = this.lookupResource.error();
    if (!error) {
      return null;
    }

    return isHttpErrorStatus(error, HttpStatusCode.NotFound)
      ? `Nie znaleziono postaci "${this.requestedName()}".`
      : CHARACTER_LOOKUP_ERROR;
  }

  private rememberLookup(character: TibiaCharacterDto): void {
    this.recentCharacterNames.update((current) => {
      const withoutCurrent = current.filter(
        (name) => name.toLowerCase() !== character.name.toLowerCase(),
      );
      return [character.name, ...withoutCurrent].slice(0, MAX_RECENT_CHARACTER_NAMES);
    });

    if (this.mainCharacterService.isCurrentMain(character.name)) {
      this.mainCharacterService.refreshCurrentUserMainCharacter(character);
    }
  }
}
