import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import type {
  CharacterProgressListDto,
  CharacterProgressStatus,
  CharacterProgressTargetKind,
  CreatureDetailDto,
} from '@shared/api-contract';
import { resourceValueOr } from '../core/resource-value';
import { LocalizationService } from '../services/localization.service';
import { buildResistanceEntries, resistanceClass, type ResistanceEntry } from '../tibia/resistance';
import { MainCharacterService } from '../services/main-character.service';
import { BoostableBossesService } from './boostable-bosses.service';
import { buildBoostedDetailLabels } from './boostable-bosses-detail.labels';
import { findBoostedBossDetails } from './boosted-bosses.data';
import { findBoostedCreatureDetails } from './boosted-creatures.data';

const DEFAULT_PROGRESS_STATUS: CharacterProgressStatus = 'first-time';

interface SavedStatusQuery {
  kind: CharacterProgressTargetKind;
  name: string;
  characterName: string | null;
}

@Component({
  selector: 'app-boostable-bosses-detail',
  imports: [RouterLink],
  templateUrl: './boostable-bosses-detail.component.html',
  styleUrl: './boostable-bosses-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoostableBossesDetailComponent {
  readonly kind = input.required<'boss' | 'creature'>();
  readonly name = input.required<string>();
  protected readonly selectedStatus = linkedSignal<CharacterProgressStatus>(
    () => this.savedStatus() ?? DEFAULT_PROGRESS_STATUS,
  );
  protected readonly resistanceClass = resistanceClass;
  protected readonly isSavingStatus = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly saveSuccess = signal(false);

  protected readonly detail = computed<CreatureDetailDto | null>(() => {
    if (this.kind() === 'boss') {
      return findBoostedBossDetails(this.name());
    }

    return findBoostedCreatureDetails(this.name());
  });

  protected readonly labels = computed(() =>
    buildBoostedDetailLabels(this.localization.currentLocale() === 'pl'),
  );
  protected readonly mainCharacter = computed(() => this.mainCharacterService.character());
  protected readonly detailTypeLabel = computed(() =>
    this.kind() === 'boss' ? this.labels().boss : this.labels().creature,
  );

  private readonly savedProgressResource = rxResource({
    params: () => this.mainCharacterService.name() ?? undefined,
    stream: () => this.boostableBossesService.getCharacterProgress(),
  });
  private readonly savedProgress = resourceValueOr(this.savedProgressResource, null);
  private readonly savedStatus = computed(() =>
    findSavedStatus(this.savedProgress(), {
      kind: this.kind(),
      name: this.name(),
      characterName: this.mainCharacterService.name(),
    }),
  );

  private readonly boostableBossesService = inject(BoostableBossesService);
  private readonly mainCharacterService = inject(MainCharacterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly localization = inject(LocalizationService);

  protected resistanceEntries(detail: CreatureDetailDto): ResistanceEntry[] {
    return detail.resistances ? buildResistanceEntries(detail.resistances) : [];
  }

  protected setStatus(status: CharacterProgressStatus): void {
    this.selectedStatus.set(status);
    this.saveSuccess.set(false);
  }

  protected saveStatus(): void {
    if (!this.mainCharacter()?.name) {
      this.saveError.set(this.labels().noMainCharacter);
      return;
    }

    this.isSavingStatus.set(true);
    this.saveError.set(null);
    this.saveSuccess.set(false);

    this.boostableBossesService
      .updateCharacterProgress(this.kind(), this.name(), this.selectedStatus())
      .pipe(
        finalize(() => this.isSavingStatus.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.saveSuccess.set(true);
        },
        error: () => {
          this.saveError.set(this.labels().saveError);
        },
      });
  }
}

function findSavedStatus(
  progress: CharacterProgressListDto | null,
  query: SavedStatusQuery,
): CharacterProgressStatus | null {
  const characterName = query.characterName?.toLowerCase();
  if (!progress || !characterName) {
    return null;
  }

  const targetName = query.name.toLowerCase();
  const entry = progress.entries.find(
    (item) =>
      item.targetKind === query.kind &&
      item.targetName.toLowerCase() === targetName &&
      item.characterName.toLowerCase() === characterName,
  );

  return entry?.status ?? null;
}
