import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import type { BoostableBossesDto, TibiaCreaturesDto } from '@shared/api-contract';
import { BoostableBossesService } from './boostable-bosses.service';

@Component({
  selector: 'app-boostable-bosses',
  templateUrl: './boostable-bosses.component.html',
  styleUrl: './boostable-bosses.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoostableBossesComponent {
  protected readonly bossesData = signal<BoostableBossesDto | null>(null);
  protected readonly creaturesData = signal<TibiaCreaturesDto | null>(null);
  protected readonly isLoadingBosses = signal(true);
  protected readonly isLoadingCreatures = signal(true);
  protected readonly bossApiError = signal(false);
  protected readonly creatureApiError = signal(false);
  protected readonly isBossListCollapsed = signal(true);
  protected readonly isCreatureListCollapsed = signal(true);
  protected readonly availableBosses = computed(() => this.bossesData()?.boostableBossList ?? []);
  protected readonly availableCreatures = computed(() => this.creaturesData()?.creatureList ?? []);

  private readonly boostableBossesService = inject(BoostableBossesService);

  constructor() {
    this.loadBoostableBosses();
    this.loadCreatures();
  }

  protected loadBoostableBosses(): void {
    this.isLoadingBosses.set(true);
    this.bossApiError.set(false);
    this.boostableBossesService
      .getBoostableBosses()
      .pipe(finalize(() => this.isLoadingBosses.set(false)))
      .subscribe({
        next: (response) => this.bossesData.set(response),
        error: () => this.bossApiError.set(true),
      });
  }

  protected loadCreatures(): void {
    this.isLoadingCreatures.set(true);
    this.creatureApiError.set(false);
    this.boostableBossesService
      .getCreatures()
      .pipe(finalize(() => this.isLoadingCreatures.set(false)))
      .subscribe({
        next: (response) => this.creaturesData.set(response),
        error: () => this.creatureApiError.set(true),
      });
  }

  protected toggleBossList(): void {
    this.isBossListCollapsed.update((value) => !value);
  }

  protected toggleCreatureList(): void {
    this.isCreatureListCollapsed.update((value) => !value);
  }
}
