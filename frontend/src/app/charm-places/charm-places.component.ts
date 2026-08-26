import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LocalizationService } from '../services/localization.service';
import {
  CITIES,
  CHARM_PLACES,
  type CharmPlace,
  type Vocation,
  VOCATIONS,
} from './charm-places.data';

type SortField = 'creatureName' | 'placeName' | 'city' | 'minLevel';
type SortDir = 'asc' | 'desc';

interface CharmFilters {
  search: string;
  city: string;
  vocation: Vocation | '';
}

function matchesFilters(place: CharmPlace, filters: CharmFilters): boolean {
  const matchesSearch =
    !filters.search ||
    place.creatureName.toLowerCase().includes(filters.search) ||
    place.placeName.toLowerCase().includes(filters.search);
  const matchesCity = !filters.city || place.city === filters.city;
  const matchesVocation =
    !filters.vocation || place.recommendedVocations.includes(filters.vocation);

  return matchesSearch && matchesCity && matchesVocation;
}

interface CharmLabels {
  eyebrow: string;
  title: string;
  intro: string;
  searchPlaceholder: string;
  allCities: string;
  allVocations: string;
  cityLabel: string;
  vocationLabel: string;
  clearFilters: string;
  sortBy: string;
  sortCreature: string;
  sortPlace: string;
  sortCity: string;
  sortLevel: string;
  found: string;
  perPage: string;
  creature: string;
  place: string;
  professions: string;
  previous: string;
  next: string;
  emptyTitle: string;
  emptyAction: string;
}

// eslint-disable-next-line complexity
function buildCharmLabels(isPl: boolean): CharmLabels {
  return {
    eyebrow: 'Tibia',
    title: isPl ? 'Charm places' : 'Charm places',
    intro: isPl
      ? 'Znajdź miejsca do zdobywania charmów dla wybranej profesji i poziomu.'
      : 'Find places to farm charms for your vocation and level.',
    searchPlaceholder: isPl ? 'Szukaj potwora lub miejsca...' : 'Search creature or place...',
    allCities: isPl ? 'Wszystkie' : 'All',
    allVocations: isPl ? 'Wszystkie' : 'All',
    cityLabel: isPl ? 'Miasto' : 'City',
    vocationLabel: isPl ? 'Profesja' : 'Vocation',
    clearFilters: isPl ? 'Wyczyść filtry' : 'Clear filters',
    sortBy: isPl ? 'Sortuj' : 'Sort',
    sortCreature: isPl ? 'Potwór' : 'Creature',
    sortPlace: isPl ? 'Miejsce' : 'Place',
    sortCity: isPl ? 'Miasto' : 'City',
    sortLevel: isPl ? 'Poziom' : 'Level',
    found: isPl ? 'Znaleziono' : 'Found',
    perPage: isPl ? 'Na stronę' : 'Per page',
    creature: isPl ? 'Potwór' : 'Creature',
    place: isPl ? 'Miejsce' : 'Place',
    professions: isPl ? 'Profesje' : 'Professions',
    previous: isPl ? 'Poprzednia' : 'Previous',
    next: isPl ? 'Następna' : 'Next',
    emptyTitle: isPl
      ? 'Nie znaleziono charm places pasujących do filtrów.'
      : 'No charm places match the selected filters.',
    emptyAction: isPl ? 'Wyczyść filtry' : 'Clear filters',
  };
}

@Component({
  selector: 'app-charm-places',
  imports: [FormsModule, RouterLink],
  templateUrl: './charm-places.component.html',
  styleUrl: './charm-places.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharmPlacesComponent {
  protected readonly vocations = VOCATIONS;
  protected readonly cities = CITIES;
  protected readonly pageSizeOptions = [6, 12, 24];

  protected readonly labels = computed(() =>
    buildCharmLabels(this.localizationService.currentLocale() === 'pl'),
  );

  protected readonly searchName = signal('');
  protected readonly selectedCity = signal<string>('');
  protected readonly selectedVocation = signal<Vocation | ''>('');

  protected readonly sortField = signal<SortField>('creatureName');
  protected readonly sortDir = signal<SortDir>('asc');
  protected readonly page = signal(1);
  protected readonly pageSize = signal(12);

  protected readonly filteredPlaces = computed(() => {
    const filters: CharmFilters = {
      search: this.searchName().trim().toLowerCase(),
      city: this.selectedCity(),
      vocation: this.selectedVocation(),
    };

    return CHARM_PLACES.filter((place) => matchesFilters(place, filters));
  });

  protected readonly sortedPlaces = computed(() => {
    const field = this.sortField();
    const dir = this.sortDir();
    const multiplier = dir === 'asc' ? 1 : -1;

    return [...this.filteredPlaces()].sort((a, b) => {
      let comparison = 0;

      if (field === 'creatureName') {
        comparison = a.creatureName.localeCompare(b.creatureName);
      } else if (field === 'placeName') {
        comparison = a.placeName.localeCompare(b.placeName);
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

  protected getSortIndicator(field: SortField): string {
    if (this.sortField() !== field) {
      return '';
    }
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }
}
