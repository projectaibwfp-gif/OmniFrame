import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import type { HighscoresSnapshotsListDto } from '@shared/api-contract';
import { AppDateTimePipe } from '../core/date-time.pipe';
import { formatNumber } from '../core/number-format';
import { AppNumberPipe } from '../core/number-format.pipe';
import { resourceValueOr } from '../core/resource-value';
import { readSelectValue } from '../core/select-value';
import { MainCharacterService } from '../services/main-character.service';
import { HighscoresSnapshotsService } from './highscores-snapshots.service';
import { PAGE_SIZE, groupSnapshotRecords } from './highscores-grouping';

const DUPLICATE_SINGULAR_LABEL = '1 starszy wpis';
const FIRST_PAGE = 1;
const DEFAULT_TOTAL_PAGES = 1;
const EMPTY_TOTAL = 0;

type SortDirection = HighscoresSnapshotsListDto['sortDir'];

@Component({
  selector: 'app-highscores-snapshots',
  imports: [AppDateTimePipe, AppNumberPipe],
  templateUrl: './highscores-snapshots.component.html',
  styleUrl: './highscores-snapshots.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HighscoresSnapshotsComponent {
  protected readonly selectedWorld = signal<string | null>(null);
  protected readonly sortDir = signal<SortDirection>('desc');
  protected readonly page = signal(FIRST_PAGE);
  protected readonly pageSize = PAGE_SIZE;
  protected readonly snapshotsResource = rxResource({
    params: () => ({
      page: this.page(),
      pageSize: this.pageSize,
      world: this.selectedWorld(),
      sortDir: this.sortDir(),
    }),
    stream: ({ params }) => this.highscoresSnapshotsService.getSnapshots(params),
  });
  protected readonly snapshots = resourceValueOr(this.snapshotsResource, null);
  /** Lista światów zostaje z poprzedniej odpowiedzi, żeby select nie tracił opcji przy przeładowaniu. */
  protected readonly worlds = linkedSignal<HighscoresSnapshotsListDto | null, string[]>({
    source: this.snapshots,
    computation: (snapshots, previous) => snapshots?.worlds ?? previous?.value ?? [],
  });
  protected readonly totalPages = computed(
    () => this.snapshots()?.totalPages ?? DEFAULT_TOTAL_PAGES,
  );
  protected readonly total = computed(() => this.snapshots()?.total ?? EMPTY_TOTAL);
  protected readonly expandedCharacterId = signal<number | null>(null);
  protected readonly groupedRecords = computed(() =>
    groupSnapshotRecords(this.snapshots()?.data ?? []),
  );
  protected readonly hasRecords = computed(() => this.groupedRecords().length > 0);

  private readonly highscoresSnapshotsService = inject(HighscoresSnapshotsService);
  private readonly mainCharacterService = inject(MainCharacterService);

  constructor() {
    this.selectedWorld.set(this.mainCharacterService.world());
  }

  protected onWorldChange(event: Event): void {
    this.selectedWorld.set(readSelectValue(event));
    this.page.set(FIRST_PAGE);
  }

  protected toggleSortDirection(): void {
    this.sortDir.update((value) => (value === 'desc' ? 'asc' : 'desc'));
    this.page.set(FIRST_PAGE);
  }

  protected goToPreviousPage(): void {
    if (this.page() <= FIRST_PAGE) {
      return;
    }

    this.page.update((value) => value - 1);
  }

  protected goToNextPage(): void {
    if (this.page() >= this.totalPages()) {
      return;
    }

    this.page.update((value) => value + 1);
  }

  protected refresh(): void {
    this.snapshotsResource.reload();
  }

  protected toggleCharacterDetails(characterId: number): void {
    this.expandedCharacterId.update((currentValue) =>
      currentValue === characterId ? null : characterId,
    );
  }

  protected isCharacterDetailsExpanded(characterId: number): boolean {
    return this.expandedCharacterId() === characterId;
  }

  protected formatRank(rank: number): string {
    return `#${formatNumber(rank)}`;
  }

  protected formatDuplicateLabel(duplicatesCount: number): string {
    if (duplicatesCount === 1) {
      return DUPLICATE_SINGULAR_LABEL;
    }

    return `${duplicatesCount} starsze wpisy`;
  }

  protected formatExperienceDelta(delta: number): string {
    return `+${formatNumber(delta)}`;
  }
}
