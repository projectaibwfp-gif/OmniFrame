import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import type { BoostableBossDto, TibiaCreatureDto } from '@shared/api-contract';
import { resourceValueOr } from '../core/resource-value';
import { BoostableBossesService } from './boostable-bosses.service';
import { withResolvedBossImage } from './boosted-bosses.data';
import { withResolvedCreatureImage } from './boosted-creatures.data';

@Component({
  selector: 'app-boostable-bosses',
  imports: [RouterLink],
  templateUrl: './boostable-bosses.component.html',
  styleUrl: './boostable-bosses.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoostableBossesComponent {
  protected readonly bossesResource = rxResource({
    stream: () => this.boostableBossesService.getBoostableBosses(),
  });
  protected readonly creaturesResource = rxResource({
    stream: () => this.boostableBossesService.getCreatures(),
  });
  protected readonly bossesData = resourceValueOr(this.bossesResource, null);
  protected readonly creaturesData = resourceValueOr(this.creaturesResource, null);
  protected readonly isBossListCollapsed = signal(true);
  protected readonly isCreatureListCollapsed = signal(true);
  protected readonly boostedBoss = computed<BoostableBossDto | null>(() => {
    const boosted = this.bossesData()?.boosted;
    return boosted ? withResolvedBossImage(boosted) : null;
  });
  protected readonly boostedCreature = computed<TibiaCreatureDto | null>(() => {
    const boosted = this.creaturesData()?.boosted;
    return boosted ? withResolvedCreatureImage(boosted) : null;
  });
  protected readonly availableBosses = computed(() =>
    (this.bossesData()?.boostableBossList ?? []).map(withResolvedBossImage),
  );
  protected readonly availableCreatures = computed(() =>
    (this.creaturesData()?.creatureList ?? []).map(withResolvedCreatureImage),
  );

  private readonly boostableBossesService = inject(BoostableBossesService);

  protected toggleBossList(): void {
    this.isBossListCollapsed.update((value) => !value);
  }

  protected toggleCreatureList(): void {
    this.isCreatureListCollapsed.update((value) => !value);
  }
}
