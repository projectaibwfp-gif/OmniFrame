import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { createPagedList } from '../core/paged-list';
import { createSort } from '../core/sort';
import { LocalizationService } from '../services/localization.service';
import { CITIES, QUESTS, type Quest } from './quests.data';
import { QUEST_CATEGORIES, questCategoryClass, type QuestCategory } from './quest-category';
import { buildQuestLabels } from './quests.labels';

type SortField = 'name' | 'city' | 'minLevel' | 'category';

const INITIAL_SORT_FIELD: SortField = 'name';

interface QuestFilters {
  search: string;
  city: string;
  category: QuestCategory | '';
}

function matchesFilters(quest: Quest, filters: QuestFilters): boolean {
  const matchesSearch =
    !filters.search ||
    quest.name.toLowerCase().includes(filters.search) ||
    quest.description.toLowerCase().includes(filters.search);
  const matchesCity = !filters.city || quest.city === filters.city;
  const matchesCategory = !filters.category || quest.category === filters.category;

  return matchesSearch && matchesCity && matchesCategory;
}

@Component({
  selector: 'app-quests',
  imports: [FormsModule, RouterLink, PaginationComponent],
  templateUrl: './quests.component.html',
  styleUrl: './quests.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestsComponent {
  protected readonly cities = CITIES;
  protected readonly categories = QUEST_CATEGORIES;

  protected readonly labels = computed(() =>
    buildQuestLabels(this.localizationService.currentLocale() === 'pl'),
  );

  protected readonly searchName = signal('');
  protected readonly selectedCity = signal<string>('');
  protected readonly selectedCategory = signal<QuestCategory | ''>('');
  protected readonly categoryClass = questCategoryClass;

  protected readonly sort = createSort<SortField>(INITIAL_SORT_FIELD, 'asc');

  protected readonly filteredQuests = computed(() => {
    const filters: QuestFilters = {
      search: this.searchName().trim().toLowerCase(),
      city: this.selectedCity(),
      category: this.selectedCategory(),
    };
    return QUESTS.filter((quest) => matchesFilters(quest, filters));
  });

  protected readonly sortedQuests = computed(() => {
    const field = this.sort.field();
    const multiplier = this.sort.multiplier();
    return [...this.filteredQuests()].sort((a, b) => {
      let comparison = 0;
      if (field === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (field === 'city') {
        comparison = a.city.localeCompare(b.city);
      } else if (field === 'minLevel') {
        comparison = a.minLevel - b.minLevel;
      } else if (field === 'category') {
        comparison = a.category.localeCompare(b.category);
      }
      return comparison * multiplier;
    });
  });

  protected readonly paged = createPagedList(this.sortedQuests);

  private readonly localizationService = inject(LocalizationService);

  protected setSearchName(value: string): void {
    this.searchName.set(value);
    this.paged.resetPage();
  }

  protected setCity(value: string): void {
    this.selectedCity.set(value);
    this.paged.resetPage();
  }

  protected setCategory(value: QuestCategory | ''): void {
    this.selectedCategory.set(value);
    this.paged.resetPage();
  }

  protected toggleSort(field: SortField): void {
    this.sort.toggle(field);
    this.paged.resetPage();
  }

  protected clearFilters(): void {
    this.searchName.set('');
    this.selectedCity.set('');
    this.selectedCategory.set('');
    this.sort.reset();
    this.paged.resetPage();
  }

  protected getCategoryLabel(category: QuestCategory): string {
    const labels = this.labels();
    return labels[category];
  }
}
