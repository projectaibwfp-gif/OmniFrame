import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { createPagedList } from '../core/paged-list';
import { createSort } from '../core/sort';
import { LocalizationService } from '../services/localization.service';
import { vocationClass, type Vocation, VOCATIONS } from '../tibia/vocation';
import { HUNTING_PLACES, type HuntingPlace } from './hunting-places.data';
import { buildHuntingLabels } from './hunting-places.labels';
import {
  weaponTypesForPlace,
  type WeaponElement,
  WEAPON_ELEMENTS,
} from './hunting-places.weapon-type';

type SortField = 'name' | 'minLevel';
type VocationTab = Vocation | 'Teamhunts';

const TEAMHUNTS_TAB = 'Teamhunts';
const MIN_TEAMHUNT_VOCATIONS = 2;

interface HuntingFilters {
  search: string;
  tab: VocationTab;
  min: number | null;
  max: number | null;
  premium: boolean | null;
  weaponType: WeaponElement | '';
}

function matchesTab(place: HuntingPlace, tab: VocationTab): boolean {
  if (tab === TEAMHUNTS_TAB) {
    return place.recommendedVocations.length >= MIN_TEAMHUNT_VOCATIONS;
  }

  return place.recommendedVocations.includes(tab);
}

function matchesSearch(place: HuntingPlace, search: string): boolean {
  return !search || place.name.toLowerCase().includes(search);
}

function matchesLevelRange(place: HuntingPlace, min: number | null, max: number | null): boolean {
  const matchesMin = min === null || place.minLevel >= min;
  const matchesMax = max === null || place.minLevel <= max;

  return matchesMin && matchesMax;
}

function matchesPremium(place: HuntingPlace, premium: boolean | null): boolean {
  return premium === null || place.premium === premium;
}

function matchesWeaponType(place: HuntingPlace, weaponType: WeaponElement | ''): boolean {
  return !weaponType || weaponTypesForPlace(place).includes(weaponType);
}

function matchesFilters(place: HuntingPlace, filters: HuntingFilters): boolean {
  return [
    matchesSearch(place, filters.search),
    matchesTab(place, filters.tab),
    matchesLevelRange(place, filters.min, filters.max),
    matchesPremium(place, filters.premium),
    matchesWeaponType(place, filters.weaponType),
  ].every(Boolean);
}

@Component({
  selector: 'app-hunting-places',
  imports: [FormsModule, RouterLink, PaginationComponent],
  templateUrl: './hunting-places.component.html',
  styleUrl: './hunting-places.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HuntingPlacesComponent {
  protected readonly vocationTabs: VocationTab[] = [...VOCATIONS, TEAMHUNTS_TAB];
  protected readonly weaponElements = WEAPON_ELEMENTS;
  protected readonly vocationClass = vocationClass;
  protected readonly weaponTypesForPlace = weaponTypesForPlace;

  protected readonly labels = computed(() =>
    buildHuntingLabels(this.localizationService.currentLocale() === 'pl'),
  );

  protected readonly searchName = signal('');
  protected readonly activeTab = signal<VocationTab>(VOCATIONS[0]);
  protected readonly minLevel = signal<number | null>(null);
  protected readonly maxLevel = signal<number | null>(null);
  protected readonly onlyPremium = signal<boolean | null>(null);
  protected readonly selectedWeaponType = signal<WeaponElement | ''>('');

  protected readonly sort = createSort<SortField>('minLevel', 'desc');

  protected readonly filteredPlaces = computed(() => {
    const filters: HuntingFilters = {
      search: this.searchName().trim().toLowerCase(),
      tab: this.activeTab(),
      min: this.minLevel(),
      max: this.maxLevel(),
      premium: this.onlyPremium(),
      weaponType: this.selectedWeaponType(),
    };

    return HUNTING_PLACES.filter((place) => matchesFilters(place, filters));
  });

  protected readonly sortedPlaces = computed(() => {
    const field = this.sort.field();
    const multiplier = this.sort.multiplier();

    return [...this.filteredPlaces()].sort((a, b) => {
      const comparison = field === 'name' ? a.name.localeCompare(b.name) : a.minLevel - b.minLevel;

      return comparison * multiplier;
    });
  });

  protected readonly paged = createPagedList(this.sortedPlaces);

  private readonly localizationService = inject(LocalizationService);

  protected setSearchName(value: string): void {
    this.searchName.set(value);
    this.paged.resetPage();
  }

  protected tabClass(tab: VocationTab): string {
    return tab === TEAMHUNTS_TAB ? '' : vocationClass(tab);
  }

  protected setActiveTab(tab: VocationTab): void {
    this.activeTab.set(tab);
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

  protected setWeaponType(value: WeaponElement | ''): void {
    this.selectedWeaponType.set(value);
    this.paged.resetPage();
  }

  protected clearFilters(): void {
    this.searchName.set('');
    this.minLevel.set(null);
    this.maxLevel.set(null);
    this.onlyPremium.set(null);
    this.selectedWeaponType.set('');
    this.paged.resetPage();
  }
}
