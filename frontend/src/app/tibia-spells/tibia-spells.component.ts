import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { createPagedList } from '../core/paged-list';
import { resourceValueOr } from '../core/resource-value';
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
  protected readonly spellsResource = rxResource({
    stream: () => this.tibiaSpellsService.getSpells(),
  });
  protected readonly data = resourceValueOr(this.spellsResource, null);
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
  protected setSearch(value: string): void {
    this.search.set(value);
    this.paged.resetPage();
  }
}
