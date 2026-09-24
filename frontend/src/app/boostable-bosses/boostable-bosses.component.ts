import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import type {
  BoostableBossDto,
  BoostableBossesDto,
  TibiaCreatureDto,
  TibiaCreaturesDto,
} from '@shared/api-contract';
import { BoostableBossesService } from './boostable-bosses.service';
import { resolveBossImageUrl } from './boosted-bosses.data';
import { resolveCreatureImageUrl } from './boosted-creatures.data';

@Component({
  selector: 'app-boostable-bosses',
  imports: [RouterLink],
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
  protected readonly boostedBoss = computed<BoostableBossDto | null>(() =>
    this.withResolvedBossImage(this.bossesData()?.boosted ?? null),
  );
  protected readonly boostedCreature = computed<TibiaCreatureDto | null>(() =>
    this.withResolvedCreatureImage(this.creaturesData()?.boosted ?? null),
  );
  protected readonly availableBosses = computed(() =>
    (this.bossesData()?.boostableBossList ?? []).map((boss) => this.withResolvedBossImage(boss)!),
  );
  protected readonly availableCreatures = computed(() =>
    (this.creaturesData()?.creatureList ?? []).map((creature) =>
      this.withResolvedCreatureImage(creature)!,
    ),
  );

  private readonly boostableBossesService = inject(BoostableBossesService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.loadBoostableBosses();
    this.loadCreatures();
  }

  protected loadBoostableBosses(): void {
    this.isLoadingBosses.set(true);
    this.bossApiError.set(false);
    this.boostableBossesService
      .getBoostableBosses()
      .pipe(
        finalize(() => this.isLoadingBosses.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
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
      .pipe(
        finalize(() => this.isLoadingCreatures.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
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

  private withResolvedBossImage(boss: BoostableBossDto | null): BoostableBossDto | null {
    if (!boss) {
      return null;
    }

    return { ...boss, imageUrl: resolveBossImageUrl(boss.name, boss.imageUrl) };
  }

  private withResolvedCreatureImage(creature: TibiaCreatureDto | null): TibiaCreatureDto | null {
    if (!creature) {
      return null;
    }

    return { ...creature, imageUrl: resolveCreatureImageUrl(creature.name, creature.imageUrl) };
  }
}
