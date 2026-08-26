import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LocalizationService } from '../services/localization.service';
import { NewsService } from './news.service';
import type { TibiaNewsDto } from '@shared/api-contract';

interface NewsLabels {
  eyebrow: string;
  title: string;
  intro: string;
  searchPlaceholder: string;
  categoryLabel: string;
  allCategories: string;
  allTypes: string;
  typeLabel: string;
  clearFilters: string;
  sortBy: string;
  sortDate: string;
  sortTitle: string;
  sortCategory: string;
  found: string;
  perPage: string;
  previous: string;
  next: string;
  emptyTitle: string;
  emptyAction: string;
  readMore: string;
  cachedAt: string;
  error: string;
  retry: string;
}

interface NewsFilters {
  search: string;
  category: string;
  type: string;
}

function matchesFilters(news: TibiaNewsDto, filters: NewsFilters): boolean {
  const matchesSearch =
    !filters.search ||
    news.title.toLowerCase().includes(filters.search) ||
    news.category.toLowerCase().includes(filters.search);
  const matchesCategory = !filters.category || news.category === filters.category;
  const matchesType = !filters.type || news.type === filters.type;

  return matchesSearch && matchesCategory && matchesType;
}

// eslint-disable-next-line complexity
function buildNewsLabels(isPl: boolean): NewsLabels {
  return {
    eyebrow: 'Tibia',
    title: isPl ? 'Aktualności' : 'News',
    intro: isPl
      ? 'Najnowsze newsy i aktualności z oficjalnej strony Tibia.'
      : 'Latest news and updates from the official Tibia website.',
    searchPlaceholder: isPl ? 'Szukaj newsa...' : 'Search news...',
    categoryLabel: isPl ? 'Kategoria' : 'Category',
    allCategories: isPl ? 'Wszystkie' : 'All',
    allTypes: isPl ? 'Wszystkie' : 'All',
    typeLabel: isPl ? 'Typ' : 'Type',
    clearFilters: isPl ? 'Wyczyść filtry' : 'Clear filters',
    sortBy: isPl ? 'Sortuj' : 'Sort',
    sortDate: isPl ? 'Data' : 'Date',
    sortTitle: isPl ? 'Tytuł' : 'Title',
    sortCategory: isPl ? 'Kategoria' : 'Category',
    found: isPl ? 'Znaleziono' : 'Found',
    perPage: isPl ? 'Na stronę' : 'Per page',
    previous: isPl ? 'Poprzednia' : 'Previous',
    next: isPl ? 'Następna' : 'Next',
    emptyTitle: isPl ? 'Nie znaleziono newsów.' : 'No news found.',
    emptyAction: isPl ? 'Wyczyść filtry' : 'Clear filters',
    readMore: isPl ? 'Czytaj więcej' : 'Read more',
    cachedAt: isPl ? 'Cache z' : 'Cached at',
    error: isPl ? 'Nie udało się załadować newsów.' : 'Could not load news.',
    retry: isPl ? 'Spróbuj ponownie' : 'Try again',
  };
}

type SortField = 'date' | 'title' | 'category';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-news',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsComponent {
  protected readonly labels = computed(() =>
    buildNewsLabels(this.localizationService.currentLocale() === 'pl'),
  );

  protected readonly newsList = signal<TibiaNewsDto[]>([]);
  protected readonly cachedAt = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly search = signal('');
  protected readonly selectedCategory = signal<string>('');
  protected readonly selectedType = signal<string>('');

  protected readonly sortField = signal<SortField>('date');
  protected readonly sortDir = signal<SortDir>('desc');
  protected readonly page = signal(1);
  protected readonly pageSize = signal(12);

  protected readonly categories = computed(() => [
    ...new Set(this.newsList().map((item) => item.category)),
  ]);

  protected readonly types = computed(() => [...new Set(this.newsList().map((item) => item.type))]);

  protected readonly pageSizeOptions = [6, 12, 24];

  protected readonly filteredNews = computed(() => {
    const filters: NewsFilters = {
      search: this.search().trim().toLowerCase(),
      category: this.selectedCategory(),
      type: this.selectedType(),
    };
    return this.newsList().filter((item) => matchesFilters(item, filters));
  });

  protected readonly sortedNews = computed(() => {
    const field = this.sortField();
    const dir = this.sortDir();
    return [...this.filteredNews()].sort((a, b) => {
      let comparison = 0;
      if (field === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (field === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (field === 'category') {
        comparison = a.category.localeCompare(b.category);
      }
      return dir === 'asc' ? comparison : -comparison;
    });
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.sortedNews().length / this.pageSize())),
  );

  protected readonly paginatedNews = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.sortedNews().slice(start, start + this.pageSize());
  });

  protected readonly startIndex = computed(() =>
    this.sortedNews().length === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1,
  );

  protected readonly endIndex = computed(() =>
    Math.min(this.page() * this.pageSize(), this.sortedNews().length),
  );

  private readonly newsService = inject(NewsService);
  private readonly localizationService = inject(LocalizationService);

  constructor() {
    this.loadNews();
  }

  protected loadNews(): void {
    this.loading.set(true);
    this.error.set(null);
    this.newsService.getNews().subscribe({
      next: (response) => {
        this.newsList.set(response.news);
        this.cachedAt.set(response.cachedAt);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.labels().error);
        this.loading.set(false);
      },
    });
  }

  protected setSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  protected setCategory(value: string): void {
    this.selectedCategory.set(value);
    this.page.set(1);
  }

  protected setType(value: string): void {
    this.selectedType.set(value);
    this.page.set(1);
  }

  protected setSortField(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDir.update((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(field);
      this.sortDir.set('desc');
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
    this.search.set('');
    this.selectedCategory.set('');
    this.selectedType.set('');
    this.sortField.set('date');
    this.sortDir.set('desc');
    this.page.set(1);
  }
}
