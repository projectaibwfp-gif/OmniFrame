import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import type { HighscoresSnapshotRecordDto } from '@shared/api-contract';
import { HighscoresSnapshotsService } from './highscores-snapshots.service';
import { PAGE_SIZE, formatCheckedAt, groupSnapshotRecords } from './highscores-grouping';

const DUPLICATE_SINGULAR_LABEL = '1 starszy wpis';

@Component({
  selector: 'app-highscores-snapshots',
  templateUrl: './highscores-snapshots.component.html',
  styleUrl: './highscores-snapshots.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HighscoresSnapshotsComponent {
  protected readonly records = signal<HighscoresSnapshotRecordDto[]>([]);
  protected readonly worlds = signal<string[]>([]);
  protected readonly selectedWorld = signal<string | null>(null);
  protected readonly sortDir = signal<'asc' | 'desc'>('desc');
  protected readonly page = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly total = signal(0);
  protected readonly isLoading = signal(true);
  protected readonly apiError = signal(false);
  protected readonly expandedCharacterId = signal<number | null>(null);
  protected readonly pageSize = PAGE_SIZE;
  protected readonly groupedRecords = computed(() => groupSnapshotRecords(this.records()));
  protected readonly hasRecords = computed(() => this.groupedRecords().length > 0);
  protected readonly formatCheckedAt = formatCheckedAt;

  private readonly highscoresSnapshotsService = inject(HighscoresSnapshotsService);

  constructor() {
    this.loadSnapshots();
  }

  protected onWorldChange(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    this.setWorld(target.value);
  }

  protected toggleSortDirection(): void {
    this.sortDir.update((value) => (value === 'desc' ? 'asc' : 'desc'));
    this.page.set(1);
    this.loadSnapshots();
  }

  protected goToPreviousPage(): void {
    if (this.page() <= 1) {
      return;
    }

    this.page.update((value) => value - 1);
    this.loadSnapshots();
  }

  protected goToNextPage(): void {
    if (this.page() >= this.totalPages()) {
      return;
    }

    this.page.update((value) => value + 1);
    this.loadSnapshots();
  }

  protected refresh(): void {
    this.loadSnapshots();
  }

  protected toggleCharacterDetails(characterId: number): void {
    this.expandedCharacterId.update((currentValue) =>
      currentValue === characterId ? null : characterId,
    );
  }

  protected isCharacterDetailsExpanded(characterId: number): boolean {
    return this.expandedCharacterId() === characterId;
  }

  protected formatExperience(value: number): string {
    return value.toLocaleString('en-US');
  }

  protected formatRank(rank: number): string {
    return `#${rank.toLocaleString('en-US')}`;
  }

  protected formatDuplicateLabel(duplicatesCount: number): string {
    if (duplicatesCount === 1) {
      return DUPLICATE_SINGULAR_LABEL;
    }

    return `${duplicatesCount} starsze wpisy`;
  }

  protected formatExperienceDelta(delta: number): string {
    return `+${delta.toLocaleString('en-US')}`;
  }

  private setWorld(world: string): void {
    this.selectedWorld.set(world === '' ? null : world);
    this.page.set(1);
    this.loadSnapshots();
  }

  private loadSnapshots(): void {
    this.isLoading.set(true);
    this.apiError.set(false);

    this.highscoresSnapshotsService
      .getSnapshots({
        page: this.page(),
        pageSize: this.pageSize,
        world: this.selectedWorld(),
        sortDir: this.sortDir(),
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.records.set(response.data);
          this.worlds.set(response.worlds);
          this.total.set(response.total);
          this.totalPages.set(response.totalPages);
        },
        error: () => this.apiError.set(true),
      });
  }
}
