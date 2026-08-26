import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { createPagedList } from '../core/paged-list';
import { createSort } from '../core/sort';
import { LocalizationService } from '../services/localization.service';
import { VOCATIONS, vocationClass, type Vocation } from '../tibia/vocation';
import { CITIES, CHARM_PLACES, type CharmPlace } from './charm-places.data';
import { buildCharmLabels } from './charm-places.labels';

type SortField = 'creatureName' | 'placeName' | 'city' | 'minLevel';

const INITIAL_SORT_FIELD: SortField = 'creatureName';

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

@Component({
  selector: 'app-charm-places',
  imports: [FormsModule, RouterLink, PaginationComponent],
  templateUrl: './charm-places.component.html',
  styleUrl: './charm-places.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharmPlacesComponent {
  protected readonly vocations = VOCATIONS;
  protected readonly cities = CITIES;
  protected readonly vocationClass = vocationClass;

  protected readonly labels = computed(() =>
    buildCharmLabels(this.localizationService.currentLocale() === 'pl'),
  );

  protected readonly searchName = signal('');
  protected readonly selectedCity = signal<string>('');
  protected readonly selectedVocation = signal<Vocation | ''>('');

  protected readonly sort = createSort<SortField>(INITIAL_SORT_FIELD, 'asc');

  protected readonly filteredPlaces = computed(() => {
    const filters: CharmFilters = {
      search: this.searchName().trim().toLowerCase(),
      city: this.selectedCity(),
      vocation: this.selectedVocation(),
    };

    return CHARM_PLACES.filter((place) => matchesFilters(place, filters));
  });

  protected readonly sortedPlaces = computed(() => {
    const field = this.sort.field();
    const multiplier = this.sort.multiplier();

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

  protected clearFilters(): void {
    this.searchName.set('');
    this.selectedCity.set('');
    this.selectedVocation.set('');
    this.paged.resetPage();
  }
}
