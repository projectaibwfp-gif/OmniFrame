import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import type {
  CharacterProgressStatus,
  CreatureDetailDto,
  CreatureResistances,
} from '@shared/api-contract';
import { LocalizationService } from '../services/localization.service';
import { MainCharacterService } from '../services/main-character.service';
import { BoostableBossesService } from './boostable-bosses.service';
import { buildBoostedDetailLabels } from './boostable-bosses-detail.labels';
import { findBoostedBossDetails } from './boosted-bosses.data';
import { findBoostedCreatureDetails } from './boosted-creatures.data';

interface ResistanceEntry {
  label: string;
  value: number;
}

const RESISTANCE_ORDER: (keyof CreatureResistances)[] = [
  'physical',
  'fire',
  'ice',
  'energy',
  'earth',
  'holy',
  'death',
];

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
  protected readonly selectedStatus = signal<CharacterProgressStatus>('first-time');
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

  private readonly boostableBossesService = inject(BoostableBossesService);
  private readonly mainCharacterService = inject(MainCharacterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly localization = inject(LocalizationService);

  constructor() {
    this.loadSavedStatus();
  }

  protected resistanceEntries(detail: CreatureDetailDto): ResistanceEntry[] {
    if (!detail.resistances) {
      return [];
    }

    return RESISTANCE_ORDER.map((key) => ({ label: key, value: detail.resistances![key] }));
  }

  protected resistanceClass(value: number): string {
    if (value <= -100) {
      return 'resist-immune';
    }
    if (value < 0) {
      return 'resist-strong';
    }
    if (value > 0) {
      return 'resist-weak';
    }
    return 'resist-neutral';
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

  private loadSavedStatus(): void {
    this.boostableBossesService
      .getCharacterProgress()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const mainCharacterName = this.mainCharacterService.name()?.toLowerCase();
          const entry = response.entries.find(
            (item) =>
              item.targetKind === this.kind() &&
              item.targetName.toLowerCase() === this.name().toLowerCase() &&
              item.characterName.toLowerCase() === mainCharacterName,
          );

          if (entry) {
            this.selectedStatus.set(entry.status);
          }
        },
      });
  }
}
