import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import type { TibiaKillStatisticsEntryDto } from '@shared/api-contract';
import { AppDateTimePipe } from '../core/date-time.pipe';
import { AppNumberPipe } from '../core/number-format.pipe';
import { resourceValueOr } from '../core/resource-value';
import { readSelectValue } from '../core/select-value';
import { MainCharacterService } from '../services/main-character.service';
import { WorldOptionsService } from '../tibia-worlds/world-options.service';
import { TibiaKillStatisticsService } from './tibia-killstatistics.service';

type BossFilter = 'all' | 'today' | 'week' | 'old';
type EntryPredicate = (entry: TibiaKillStatisticsEntryDto) => boolean;

const BOSS_MAX_WEEKLY_KILLS = 100;
const NO_KILLS = 0;

const isBossCandidate: EntryPredicate = (entry) =>
  entry.lastWeekKilled > NO_KILLS && entry.lastWeekKilled <= BOSS_MAX_WEEKLY_KILLS;
const wasKilledToday: EntryPredicate = (entry) => entry.lastDayKilled > NO_KILLS;

const BOSS_FILTERS: Record<BossFilter, EntryPredicate> = {
  all: () => true,
  today: (entry) => isBossCandidate(entry) && wasKilledToday(entry),
  week: (entry) => isBossCandidate(entry) && entry.lastDayKilled === NO_KILLS,
  old: (entry) => entry.lastWeekKilled === NO_KILLS && entry.lastDayKilled === NO_KILLS,
};

@Component({
  selector: 'app-tibia-killstatistics',
  imports: [AppDateTimePipe, AppNumberPipe],
  templateUrl: './tibia-killstatistics.component.html',
  styleUrl: './tibia-killstatistics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TibiaKillStatisticsComponent {
  protected readonly worlds = computed(() => this.worldOptions.options());
  protected readonly worldsError = computed(() => this.worldOptions.hasError());
  protected readonly selectedWorld = linkedSignal(() => this.mainCharacterService.world());
  protected readonly statisticsResource = rxResource({
    params: () => this.selectedWorld() ?? undefined,
    stream: ({ params: world }) => this.tibiaKillStatisticsService.getKillStatistics(world),
  });
  protected readonly bossFilter = signal<BossFilter>('all');

  protected readonly statisticsData = resourceValueOr(this.statisticsResource, null);
  protected readonly statistics = computed(() => this.statisticsData()?.entries ?? []);
  protected readonly updatedAt = computed(() => this.statisticsData()?.updatedAt ?? null);
  protected readonly hasStatistics = computed(() => this.statistics().length > 0);
  protected readonly selectedWorldLabel = computed(() => this.selectedWorld() ?? '');

  protected readonly bossesKilledToday = computed(() =>
    this.statistics()
      .filter(BOSS_FILTERS.today)
      .sort((a, b) => b.lastDayKilled - a.lastDayKilled),
  );

  protected readonly filteredStatistics = computed(() =>
    this.statistics().filter(BOSS_FILTERS[this.bossFilter()]),
  );

  private readonly tibiaKillStatisticsService = inject(TibiaKillStatisticsService);
  private readonly worldOptions = inject(WorldOptionsService);
  private readonly mainCharacterService = inject(MainCharacterService);

  constructor() {
    this.worldOptions.retryIfFailed();
  }

  protected onWorldChange(event: Event): void {
    this.selectedWorld.set(readSelectValue(event));
  }

  protected refresh(): void {
    this.statisticsResource.reload();
  }

  protected setBossFilter(filter: BossFilter): void {
    this.bossFilter.set(filter);
  }
}
