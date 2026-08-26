import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LocalizationService } from '../services/localization.service';
import {
  CITIES,
  HUNTING_PLACES,
  type HuntingPlace,
  type Vocation,
  VOCATIONS,
} from './hunting-places.data';

interface HuntingLabels {
  eyebrow: string;
  title: string;
  intro: string;
  searchPlaceholder: string;
  allCities: string;
  allVocations: string;
  cityLabel: string;
  vocationLabel: string;
  levelLabel: string;
  levelFrom: string;
  levelTo: string;
  accessLabel: string;
  allAccess: string;
  premiumAccess: string;
  freeAccess: string;
  clearFilters: string;
  sortBy: string;
  sortName: string;
  sortMinLevel: string;
  sortMaxLevel: string;
  sortCity: string;
  found: string;
  perPage: string;
  creatures: string;
  vocations: string;
  exp: string;
  profit: string;
  previous: string;
  next: string;
  emptyTitle: string;
  emptyAction: string;
  low: string;
  medium: string;
  high: string;
}

type SortField = 'name' | 'minLevel' | 'maxLevel' | 'city';
type SortDir = 'asc' | 'desc';

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

// eslint-disable-next-line complexity
function buildHuntingLabels(isPl: boolean): HuntingLabels {
  return {
    eyebrow: 'Tibia',
    title: isPl ? 'Miejsca polowań' : 'Hunting places',
    intro: isPl
      ? 'Wyszukaj i przefiltruj miejsca polowań dopasowane do poziomu i profesji.'
      : 'Search and filter hunting places matching your level and vocation.',
    searchPlaceholder: isPl ? 'Szukaj miejsca...' : 'Search place...',
    allCities: isPl ? 'Wszystkie' : 'All',
    allVocations: isPl ? 'Wszystkie' : 'All',
    cityLabel: isPl ? 'Miasto' : 'City',
    vocationLabel: isPl ? 'Profesja' : 'Vocation',
    levelLabel: isPl ? 'Poziom' : 'Level',
    levelFrom: isPl ? 'Od' : 'From',
    levelTo: isPl ? 'Do' : 'To',
    accessLabel: isPl ? 'Dostęp' : 'Access',
    allAccess: isPl ? 'Wszystkie' : 'All',
    premiumAccess: 'Premium',
    freeAccess: 'Free',
    clearFilters: isPl ? 'Wyczyść filtry' : 'Clear filters',
    sortBy: isPl ? 'Sortuj' : 'Sort',
    sortName: isPl ? 'Nazwa' : 'Name',
    sortMinLevel: isPl ? 'Poziom min' : 'Min level',
    sortMaxLevel: isPl ? 'Poziom max' : 'Max level',
    sortCity: isPl ? 'Miasto' : 'City',
    found: isPl ? 'Znaleziono' : 'Found',
    perPage: isPl ? 'Na stronę' : 'Per page',
    creatures: isPl ? 'Potwory' : 'Creatures',
    vocations: isPl ? 'Profesje' : 'Vocations',
    exp: 'EXP',
    profit: 'Profit',
    previous: isPl ? 'Poprzednia' : 'Previous',
    next: isPl ? 'Następna' : 'Next',
    emptyTitle: isPl
      ? 'Nie znaleziono miejsc polowań pasujących do filtrów.'
      : 'No hunting places match the selected filters.',
    emptyAction: isPl ? 'Wyczyść filtry' : 'Clear filters',
    low: isPl ? 'Niskie' : 'Low',
    medium: isPl ? 'Średnie' : 'Medium',
    high: isPl ? 'Wysokie' : 'High',
  };
}

@Component({
  selector: 'app-hunting-places',
  imports: [FormsModule, RouterLink],
  templateUrl: './hunting-places.component.html',
  styleUrl: './hunting-places.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuntingPlacesComponent {
  protected readonly vocations = VOCATIONS;
  protected readonly cities = CITIES;
  protected readonly pageSizeOptions = [6, 12, 24];

  protected readonly labels = computed(() =>
    buildHuntingLabels(this.localizationService.currentLocale() === 'pl'),
  );

  protected readonly searchName = signal('');
  protected readonly selectedCity = signal<string>('');
  protected readonly selectedVocation = signal<Vocation | ''>('');
  protected readonly minLevel = signal<number | null>(null);
  protected readonly maxLevel = signal<number | null>(null);
  protected readonly onlyPremium = signal<boolean | null>(null);

  protected readonly sortField = signal<SortField>('minLevel');
  protected readonly sortDir = signal<SortDir>('asc');
  protected readonly page = signal(1);
  protected readonly pageSize = signal(12);

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
    const field = this.sortField();
    const dir = this.sortDir();
    const multiplier = dir === 'asc' ? 1 : -1;

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

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.sortedPlaces().length / this.pageSize())),
  );

  protected readonly paginatedPlaces = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.sortedPlaces().slice(start, start + this.pageSize());
  });

  protected readonly startIndex = computed(() => (this.page() - 1) * this.pageSize() + 1);
  protected readonly endIndex = computed(() =>
    Math.min(this.page() * this.pageSize(), this.sortedPlaces().length),
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

  protected setVocation(value: Vocation | ''): void {
    this.selectedVocation.set(value);
    this.page.set(1);
  }

  protected setMinLevel(value: number | null): void {
    this.minLevel.set(value);
    this.page.set(1);
  }

  protected setMaxLevel(value: number | null): void {
    this.maxLevel.set(value);
    this.page.set(1);
  }

  protected setOnlyPremium(value: boolean | null): void {
    this.onlyPremium.set(value);
    this.page.set(1);
  }

  protected setSortField(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDir.update((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
  }

  protected setPage(page: number): void {
    this.page.set(page);
  }

  protected setPageSize(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
  }

  protected clearFilters(): void {
    this.searchName.set('');
    this.selectedCity.set('');
    this.selectedVocation.set('');
    this.minLevel.set(null);
    this.maxLevel.set(null);
    this.onlyPremium.set(null);
    this.page.set(1);
  }

  protected getVocationClass(vocation: Vocation): string {
    const map: Record<Vocation, string> = {
      Knight: 'vocation-knight',
      Paladin: 'vocation-paladin',
      Mage: 'vocation-mage',
      Druid: 'vocation-druid',
      Sorcerer: 'vocation-sorcerer',
      Monk: 'vocation-monk',
    };
    return map[vocation];
  }

  protected getRateClass(rate: 'low' | 'medium' | 'high'): string {
    return `rate-${rate}`;
  }

  protected getRateLabel(rate: 'low' | 'medium' | 'high'): string {
    const labels = this.labels();
    const map = { low: labels.low, medium: labels.medium, high: labels.high };
    return map[rate];
  }

  protected getSortIndicator(field: SortField): string {
    if (this.sortField() !== field) {
      return '';
    }
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }
}
