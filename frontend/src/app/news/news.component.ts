import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { createPagedList } from '../core/paged-list';
import { createSort } from '../core/sort';
import { LocalizationService } from '../services/localization.service';
import { NewsService } from './news.service';
import { buildNewsLabels } from './news.labels';
import type { TibiaNewsDto } from '@shared/api-contract';

interface NewsFilters {
  search: string;
  category: string;
  type: string;
}

type SortField = 'date' | 'title' | 'category';

function matchesFilters(news: TibiaNewsDto, filters: NewsFilters): boolean {
  const matchesSearch =
    !filters.search ||
    news.title.toLowerCase().includes(filters.search) ||
    news.category.toLowerCase().includes(filters.search);
  const matchesCategory = !filters.category || news.category === filters.category;
  const matchesType = !filters.type || news.type === filters.type;

  return matchesSearch && matchesCategory && matchesType;
}

@Component({
  selector: 'app-news',
  imports: [FormsModule, DatePipe, PaginationComponent],
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

  protected readonly sort = createSort<SortField>('date', 'desc');

  protected readonly categories = computed(() => [
    ...new Set(this.newsList().map((item) => item.category)),
  ]);

  protected readonly types = computed(() => [...new Set(this.newsList().map((item) => item.type))]);

  protected readonly filteredNews = computed(() => {
    const filters: NewsFilters = {
      search: this.search().trim().toLowerCase(),
      category: this.selectedCategory(),
      type: this.selectedType(),
    };
    return this.newsList().filter((item) => matchesFilters(item, filters));
  });

  protected readonly sortedNews = computed(() => {
    const field = this.sort.field();
    const multiplier = this.sort.multiplier();
    return [...this.filteredNews()].sort((a, b) => {
      let comparison = 0;
      if (field === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (field === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (field === 'category') {
        comparison = a.category.localeCompare(b.category);
      }
      return comparison * multiplier;
    });
  });

  protected readonly paged = createPagedList(this.sortedNews);

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
    this.paged.resetPage();
  }

  protected setCategory(value: string): void {
    this.selectedCategory.set(value);
    this.paged.resetPage();
  }

  protected setType(value: string): void {
    this.selectedType.set(value);
    this.paged.resetPage();
  }

  protected toggleSort(field: SortField): void {
    this.sort.toggle(field);
    this.paged.resetPage();
  }

  protected clearFilters(): void {
    this.search.set('');
    this.selectedCategory.set('');
    this.selectedType.set('');
    this.sort.reset();
    this.paged.resetPage();
  }
}
