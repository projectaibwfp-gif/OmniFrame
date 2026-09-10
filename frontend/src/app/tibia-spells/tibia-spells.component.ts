import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import type { TibiaSpellsOverviewDto } from '@shared/api-contract';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { createPagedList } from '../core/paged-list';
import { LocalizationService } from '../services/localization.service';
import { TibiaSpellsService } from './tibia-spells.service';
import { buildSpellsLabels } from './tibia-spells.labels';

const SPELLS_PAGE_SIZE = 24;

@Component({
  selector: 'app-tibia-spells',
  imports: [FormsModule, RouterLink, PaginationComponent],
  templateUrl: './tibia-spells.component.html',
  styleUrl: './tibia-spells.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TibiaSpellsComponent {
  protected readonly data = signal<TibiaSpellsOverviewDto | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly apiError = signal(false);
  protected readonly search = signal('');

  protected readonly labels = computed(() =>
    buildSpellsLabels(this.localization.currentLocale() === 'pl'),
  );
  protected readonly spells = computed(() => {
    const query = this.search().trim().toLowerCase();
    if (!query) {
      return this.data()?.spellList ?? [];
    }

    return (this.data()?.spellList ?? []).filter(
      (spell) =>
        spell.name.toLowerCase().includes(query) || spell.spellId.toLowerCase().includes(query),
    );
  });
  protected readonly paged = createPagedList(this.spells, SPELLS_PAGE_SIZE);

  private readonly tibiaSpellsService = inject(TibiaSpellsService);
  private readonly localization = inject(LocalizationService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.loadSpells();
  }

  protected setSearch(value: string): void {
    this.search.set(value);
    this.paged.resetPage();
  }

  protected loadSpells(): void {
    this.isLoading.set(true);
    this.apiError.set(false);

    this.tibiaSpellsService
      .getSpells()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.data.set(response),
        error: () => this.apiError.set(true),
      });
  }
}
