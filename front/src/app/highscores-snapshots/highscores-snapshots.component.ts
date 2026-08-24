import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import type { HighscoresSnapshotRecordDto } from '@shared/api-contract';
import { HighscoresSnapshotsService } from './highscores-snapshots.service';

const PAGE_SIZE = 50;

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
  protected readonly pageSize = PAGE_SIZE;
  protected readonly hasRecords = computed(() => this.records().length > 0);

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
