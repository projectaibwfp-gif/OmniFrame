import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import type { HighscoresSnapshotRecordDto } from '@shared/api-contract';
import { HighscoresSnapshotsService } from './highscores-snapshots.service';

const PAGE_SIZE = 50;

type GroupedSnapshotRecord = {
  latest: HighscoresSnapshotRecordDto;
  older: HighscoresSnapshotRecordDto[];
  previousDayExperienceIncrease: number | null;
};

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
  protected readonly groupedRecords = computed<GroupedSnapshotRecord[]>(() => {
    const groups = new Map<string, HighscoresSnapshotRecordDto[]>();

    for (const record of this.records()) {
      const key = record.characterName.trim().toLowerCase();
      const current = groups.get(key) ?? [];
      current.push(record);
      groups.set(key, current);
    }

    const mappedGroups: GroupedSnapshotRecord[] = [];
    for (const groupRecords of groups.values()) {
      const sorted = [...groupRecords].sort((a, b) => {
        return this.getCheckedAtTimestamp(b.checkedAt) - this.getCheckedAtTimestamp(a.checkedAt);
      });
      mappedGroups.push({
        latest: sorted[0],
        older: sorted.slice(1),
        previousDayExperienceIncrease: this.getPreviousDayExperienceIncrease(sorted),
      });
    }

    return mappedGroups.sort((a, b) => {
      return (
        this.getCheckedAtTimestamp(b.latest.checkedAt) -
        this.getCheckedAtTimestamp(a.latest.checkedAt)
      );
    });
  });
  protected readonly hasRecords = computed(() => this.groupedRecords().length > 0);

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

  protected formatCheckedAt(checkedAt: string): string {
    if (/^\d{4}-\d{2}-\d{2}/.test(checkedAt)) {
      return checkedAt.slice(0, 10);
    }

    const parsed = new Date(checkedAt);
    if (Number.isNaN(parsed.getTime())) {
      return checkedAt;
    }

    return parsed.toISOString().slice(0, 10);
  }

  protected formatDuplicateLabel(duplicatesCount: number): string {
    if (duplicatesCount === 1) {
      return '1 starszy wpis';
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

  private getCheckedAtTimestamp(checkedAt: string): number {
    const parsed = Date.parse(checkedAt);
    if (Number.isNaN(parsed)) {
      return 0;
    }

    return parsed;
  }

  private getCheckedAtDay(checkedAt: string): string {
    if (/^\d{4}-\d{2}-\d{2}/.test(checkedAt)) {
      return checkedAt.slice(0, 10);
    }

    const parsed = new Date(checkedAt);
    if (Number.isNaN(parsed.getTime())) {
      return checkedAt;
    }

    return parsed.toISOString().slice(0, 10);
  }

  private getPreviousDayExperienceIncrease(
    sortedRecords: HighscoresSnapshotRecordDto[],
  ): number | null {
    if (sortedRecords.length < 2) {
      return null;
    }

    const latest = sortedRecords[0];
    const latestDay = this.getCheckedAtDay(latest.checkedAt);
    for (let index = 1; index < sortedRecords.length; index += 1) {
      const olderRecord = sortedRecords[index];
      const olderDay = this.getCheckedAtDay(olderRecord.checkedAt);
      if (olderDay === latestDay) {
        continue;
      }

      return latest.exactExperience - olderRecord.exactExperience;
    }

    return null;
  }
}
