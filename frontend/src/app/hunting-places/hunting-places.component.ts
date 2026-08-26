import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { createPagedList } from '../core/paged-list';
import { createSort } from '../core/sort';
import { LocalizationService } from '../services/localization.service';
import { vocationClass, type Vocation, VOCATIONS } from '../tibia/vocation';
import { CITIES, HUNTING_PLACES, type HuntingPlace } from './hunting-places.data';
import { buildHuntingLabels } from './hunting-places.labels';

type SortField = 'name' | 'minLevel' | 'maxLevel' | 'city';

interface HuntingFilters {
  search: string;
  city: string;
  vocation: Vocation | '';
  min: number | null;
  max: number | null;
  premium: boolean | null;
}

// eslint-disable-next-line complexity
function matchesFilters(place: HuntingPlace, filters: HuntingFilters): boolean {
  const matchesSearch = !filters.search || place.name.toLowerCase().includes(filters.search);
  const matchesCity = !filters.city || place.city === filters.city;
  const matchesVocation =
    !filters.vocation || place.recommendedVocations.includes(filters.vocation);
  const matchesMin = filters.min === null || place.maxLevel >= filters.min;
  const matchesMax = filters.max === null || place.minLevel <= filters.max;
  const matchesPremium = filters.premium === null || place.premium === filters.premium;

  return (
    matchesSearch && matchesCity && matchesVocation && matchesMin && matchesMax && matchesPremium
  );
}

@Component({
  selector: 'app-hunting-places',
  imports: [FormsModule, RouterLink, PaginationComponent],
  templateUrl: './hunting-places.component.html',
  styleUrl: './hunting-places.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuntingPlacesComponent {
  protected readonly vocations = VOCATIONS;
  protected readonly cities = CITIES;
  protected readonly vocationClass = vocationClass;

  protected readonly labels = computed(() =>
    buildHuntingLabels(this.localizationService.currentLocale() === 'pl'),
  );

  protected readonly searchName = signal('');
  protected readonly selectedCity = signal<string>('');
  protected readonly selectedVocation = signal<Vocation | ''>('');
  protected readonly minLevel = signal<number | null>(null);
  protected readonly maxLevel = signal<number | null>(null);
  protected readonly onlyPremium = signal<boolean | null>(null);

  protected readonly sort = createSort<SortField>('minLevel', 'asc');

  protected readonly filteredPlaces = computed(() => {
    const filters: HuntingFilters = {
      search: this.searchName().trim().toLowerCase(),
      city: this.selectedCity(),
      vocation: this.selectedVocation(),
      min: this.minLevel(),
      max: this.maxLevel(),
      premium: this.onlyPremium(),
    };

    return HUNTING_PLACES.filter((place) => matchesFilters(place, filters));
  });

  protected readonly sortedPlaces = computed(() => {
    const field = this.sort.field();
    const multiplier = this.sort.multiplier();

    return [...this.filteredPlaces()].sort((a, b) => {
      let comparison = 0;

      if (field === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (field === 'city') {
        comparison = a.city.localeCompare(b.city);
      } else {
        comparison = a[field] - b[field];
      }

      return comparison * multiplier;
    });
  });

  protected readonly paged = createPagedList(this.sortedPlaces);

  private readonly localizationService = inject(LocalizationService);

  protected setSearchName(value: string): void {
    this.searchName.set(value);
    this.paged.resetPage();
  }

  protected setCity(value: string): void {
    this.selectedCity.set(value);
    this.paged.resetPage();
  }

  protected setVocation(value: Vocation | ''): void {
    this.selectedVocation.set(value);
    this.paged.resetPage();
  }

  protected setMinLevel(value: number | null): void {
    this.minLevel.set(value);
    this.paged.resetPage();
  }

  protected setMaxLevel(value: number | null): void {
    this.maxLevel.set(value);
    this.paged.resetPage();
  }

  protected setOnlyPremium(value: boolean | null): void {
    this.onlyPremium.set(value);
    this.paged.resetPage();
  }

  protected clearFilters(): void {
    this.searchName.set('');
    this.selectedCity.set('');
    this.selectedVocation.set('');
    this.minLevel.set(null);
    this.maxLevel.set(null);
    this.onlyPremium.set(null);
    this.paged.resetPage();
  }

  protected getRateClass(rate: 'low' | 'medium' | 'high'): string {
    return `rate-${rate}`;
  }

  protected getRateLabel(rate: 'low' | 'medium' | 'high'): string {
    const labels = this.labels();
    const map = { low: labels.low, medium: labels.medium, high: labels.high };
    return map[rate];
  }
}
