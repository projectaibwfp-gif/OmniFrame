import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import type { TibiaKillStatisticsEntryDto } from '@shared/api-contract';
import { TibiaKillStatisticsService } from './tibia-killstatistics.service';

type BossFilter = 'all' | 'today' | 'week' | 'old';

const BOSS_MAX_WEEKLY_KILLS = 100;

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
  protected readonly bossFilter = signal<BossFilter>('all');

  protected readonly hasStatistics = computed(() => this.statistics().length > 0);
  protected readonly selectedWorldLabel = computed(() => this.selectedWorld() ?? '');

  protected readonly bossCandidates = computed(() =>
    this.statistics().filter(
      (entry) => entry.lastWeekKilled > 0 && entry.lastWeekKilled <= BOSS_MAX_WEEKLY_KILLS,
    ),
  );

  protected readonly bossesKilledToday = computed(() =>
    this.bossCandidates()
      .filter((entry) => entry.lastDayKilled > 0)
      .sort((a, b) => b.lastDayKilled - a.lastDayKilled),
  );

  protected readonly filteredStatistics = computed(() => {
    const filter = this.bossFilter();
    const all = this.statistics();
    if (filter === 'all') {
      return all;
    }

    const bosses = this.bossCandidates();
    if (filter === 'today') {
      return bosses.filter((entry) => entry.lastDayKilled > 0);
    }
    if (filter === 'week') {
      return bosses.filter((entry) => entry.lastDayKilled === 0 && entry.lastWeekKilled > 0);
    }
    return this.statistics().filter(
      (entry) => entry.lastWeekKilled === 0 && entry.lastDayKilled === 0,
    );
  });

  private readonly tibiaKillStatisticsService = inject(TibiaKillStatisticsService);
  private readonly destroyRef = inject(DestroyRef);

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

  protected formatTotal(value: number): string {
    return value.toLocaleString('en-US');
  }

  protected setBossFilter(filter: BossFilter): void {
    this.bossFilter.set(filter);
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
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.statistics.set(response.entries);
          this.updatedAt.set(response.updatedAt);
        },
        error: () => this.apiError.set(true),
      });
  }
}
