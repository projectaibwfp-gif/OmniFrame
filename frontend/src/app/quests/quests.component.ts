import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LocalizationService } from '../services/localization.service';
import { CITIES, QUESTS, type Quest } from './quests.data';

type SortField = 'name' | 'city' | 'minLevel' | 'category';
type SortDir = 'asc' | 'desc';

interface QuestFilters {
  search: string;
  city: string;
  category: Quest['category'] | '';
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

interface QuestLabels {
  eyebrow: string;
  title: string;
  intro: string;
  searchPlaceholder: string;
  allCities: string;
  allCategories: string;
  cityLabel: string;
  categoryLabel: string;
  clearFilters: string;
  sortBy: string;
  sortName: string;
  sortCity: string;
  sortLevel: string;
  sortCategory: string;
  found: string;
  perPage: string;
  category: string;
  minLevel: string;
  previous: string;
  next: string;
  emptyTitle: string;
  emptyAction: string;
  main: string;
  side: string;
  daily: string;
  access: string;
}

// eslint-disable-next-line complexity
function buildQuestLabels(isPl: boolean): QuestLabels {
  return {
    eyebrow: 'Tibia',
    title: isPl ? 'Questy' : 'Quests',
    intro: isPl
      ? 'Przeglądaj questy, sprawdź wymagania i odkryj spoilery wykonania.'
      : 'Browse quests, check requirements and discover walkthrough spoilers.',
    searchPlaceholder: isPl ? 'Szukaj questa...' : 'Search quest...',
    allCities: isPl ? 'Wszystkie' : 'All',
    allCategories: isPl ? 'Wszystkie' : 'All',
    cityLabel: isPl ? 'Miasto' : 'City',
    categoryLabel: isPl ? 'Kategoria' : 'Category',
    clearFilters: isPl ? 'Wyczyść filtry' : 'Clear filters',
    sortBy: isPl ? 'Sortuj' : 'Sort',
    sortName: isPl ? 'Nazwa' : 'Name',
    sortCity: isPl ? 'Miasto' : 'City',
    sortLevel: isPl ? 'Poziom' : 'Level',
    sortCategory: isPl ? 'Kategoria' : 'Category',
    found: isPl ? 'Znaleziono' : 'Found',
    perPage: isPl ? 'Na stronę' : 'Per page',
    category: isPl ? 'Kategoria' : 'Category',
    minLevel: isPl ? 'Min. poziom' : 'Min level',
    previous: isPl ? 'Poprzednia' : 'Previous',
    next: isPl ? 'Następna' : 'Next',
    emptyTitle: isPl
      ? 'Nie znaleziono questów pasujących do filtrów.'
      : 'No quests match the selected filters.',
    emptyAction: isPl ? 'Wyczyść filtry' : 'Clear filters',
    main: isPl ? 'Główny' : 'Main',
    side: isPl ? 'Poboczny' : 'Side',
    daily: isPl ? 'Dzienny' : 'Daily',
    access: isPl ? 'Dostęp' : 'Access',
  };
}

function categoryClass(category: Quest['category']): string {
  const map: Record<Quest['category'], string> = {
    main: 'category-main',
    side: 'category-side',
    daily: 'category-daily',
    access: 'category-access',
  };
  return map[category];
}

@Component({
  selector: 'app-quests',
  imports: [FormsModule, RouterLink],
  templateUrl: './quests.component.html',
  styleUrl: './quests.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestsComponent {
  protected readonly cities = CITIES;
  protected readonly categories: Quest['category'][] = ['main', 'side', 'daily', 'access'];
  protected readonly pageSizeOptions = [6, 12, 24];

  protected readonly labels = computed(() =>
    buildQuestLabels(this.localizationService.currentLocale() === 'pl'),
  );

  protected readonly searchName = signal('');
  protected readonly selectedCity = signal<string>('');
  protected readonly selectedCategory = signal<Quest['category'] | ''>('');

  protected readonly sortField = signal<SortField>('name');
  protected readonly sortDir = signal<SortDir>('asc');
  protected readonly page = signal(1);
  protected readonly pageSize = signal(12);

  protected readonly filteredQuests = computed(() => {
    const filters: QuestFilters = {
      search: this.searchName().trim().toLowerCase(),
      city: this.selectedCity(),
      category: this.selectedCategory(),
    };
    return QUESTS.filter((quest) => matchesFilters(quest, filters));
  });

  protected readonly sortedQuests = computed(() => {
    const field = this.sortField();
    const dir = this.sortDir();
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
      return dir === 'asc' ? comparison : -comparison;
    });
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.sortedQuests().length / this.pageSize())),
  );

  protected readonly paginatedQuests = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.sortedQuests().slice(start, start + this.pageSize());
  });

  protected readonly startIndex = computed(() =>
    this.sortedQuests().length === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1,
  );

  protected readonly endIndex = computed(() =>
    Math.min(this.page() * this.pageSize(), this.sortedQuests().length),
  );

  private readonly localizationService = inject(LocalizationService);

  protected setSearchName(value: string): void {
    this.searchName.set(value);
    this.page.set(1);
  }

  protected setCity(value: string): void {
    this.selectedCity.set(value);
    this.page.set(1);
  }

  protected setCategory(value: Quest['category'] | ''): void {
    this.selectedCategory.set(value);
    this.page.set(1);
  }

  protected setSortField(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDir.update((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
    this.page.set(1);
  }

  protected getSortIndicator(field: SortField): string {
    if (this.sortField() !== field) {
      return '';
    }
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }

  protected setPageSize(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
  }

  protected setPage(value: number): void {
    this.page.set(value);
  }

  protected clearFilters(): void {
    this.searchName.set('');
    this.selectedCity.set('');
    this.selectedCategory.set('');
    this.sortField.set('name');
    this.sortDir.set('asc');
    this.page.set(1);
  }

  protected getCategoryLabel(category: Quest['category']): string {
    const labels = this.labels();
    return labels[category];
  }

  protected getCategoryClass(category: Quest['category']): string {
    return categoryClass(category);
  }
}
