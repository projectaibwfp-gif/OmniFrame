import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import type { TibiaKillStatisticsEntryDto } from '@shared/api-contract';
import { TibiaKillStatisticsService } from './tibia-killstatistics.service';

@Component({
  selector: 'app-tibia-killstatistics',
  templateUrl: './tibia-killstatistics.component.html',
  styleUrl: './tibia-killstatistics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TibiaKillStatisticsComponent {
  protected readonly worlds = signal<string[]>([]);
  protected readonly selectedWorld = signal<string | null>(null);
  protected readonly statistics = signal<TibiaKillStatisticsEntryDto[]>([]);
  protected readonly updatedAt = signal<string | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly apiError = signal(false);

  protected readonly hasStatistics = computed(() => this.statistics().length > 0);
  protected readonly selectedWorldLabel = computed(() => this.selectedWorld() ?? '');

  private readonly tibiaKillStatisticsService = inject(TibiaKillStatisticsService);

  constructor() {
    this.worlds.set(['Antica', 'Secura', 'Dia']);
  }

  protected onWorldChange(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    this.setWorld(target.value);
  }

  protected refresh(): void {
    const world = this.selectedWorld();
    if (!world) {
      return;
    }

    this.loadStatistics(world);
  }

  private setWorld(world: string): void {
    this.selectedWorld.set(world === '' ? null : world);
    this.statistics.set([]);
    this.updatedAt.set(null);

    if (!world) {
      return;
    }

    this.loadStatistics(world);
  }

  private loadStatistics(world: string): void {
    this.isLoading.set(true);
    this.apiError.set(false);

    this.tibiaKillStatisticsService
      .getKillStatistics(world)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.statistics.set(response.entries);
          this.updatedAt.set(response.updatedAt);
        },
        error: () => this.apiError.set(true),
      });
  }
}
