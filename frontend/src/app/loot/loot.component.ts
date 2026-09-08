import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { createPagedList } from '../core/paged-list';
import { createSort } from '../core/sort';
import { LocalizationService } from '../services/localization.service';
import { LOOT_CATEGORIES, LOOT_ITEMS, type LootCategory, type LootItem } from './loot.data';
import { buildLootLabels, CATEGORY_LABELS } from './loot.labels';

type SortField = 'name' | 'category' | 'marketValue' | 'membersOnly';
type MembersFilter = '' | 'members' | 'free';
type StackableFilter = '' | 'stackable' | 'non-stackable';

interface LootFilters {
  search: string;
  category: LootCategory | '';
  members: MembersFilter;
  stackable: StackableFilter;
  minValue: number | null;
  maxValue: number | null;
}

function matchesSearch(item: LootItem, search: string): boolean {
  if (!search) {
    return true;
  }

  return [item.name, item.description, ...item.sources].some((value) =>
    value.toLowerCase().includes(search),
  );
}

function matchesCategory(item: LootItem, category: LootCategory | ''): boolean {
  return !category || item.category === category;
}

function matchesMembers(item: LootItem, members: MembersFilter): boolean {
  if (!members) {
    return true;
  }

  return members === 'members' ? item.membersOnly : !item.membersOnly;
}

function matchesStackable(item: LootItem, stackable: StackableFilter): boolean {
  if (!stackable) {
    return true;
  }

  return stackable === 'stackable' ? item.stackable : !item.stackable;
}

function matchesMarketValue(
  item: LootItem,
  minValue: number | null,
  maxValue: number | null,
): boolean {
  const matchesMin = minValue === null || item.marketValue >= minValue;
  const matchesMax = maxValue === null || item.marketValue <= maxValue;

  return matchesMin && matchesMax;
}

function matchesFilters(item: LootItem, filters: LootFilters): boolean {
  return [
    matchesSearch(item, filters.search),
    matchesCategory(item, filters.category),
    matchesMembers(item, filters.members),
    matchesStackable(item, filters.stackable),
    matchesMarketValue(item, filters.minValue, filters.maxValue),
  ].every(Boolean);
}

@Component({
  selector: 'app-loot',
  imports: [FormsModule, PaginationComponent],
  templateUrl: './loot.component.html',
  styleUrl: './loot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LootComponent {
  protected readonly categories = LOOT_CATEGORIES;
  protected readonly labels = computed(() =>
    buildLootLabels(this.localizationService.currentLocale() === 'pl'),
  );

  protected readonly search = signal('');
  protected readonly selectedCategory = signal<LootCategory | ''>('');
  protected readonly selectedMembers = signal<MembersFilter>('');
  protected readonly selectedStackable = signal<StackableFilter>('');
  protected readonly minValue = signal<number | null>(null);
  protected readonly maxValue = signal<number | null>(null);

  protected readonly sort = createSort<SortField>('marketValue', 'desc');

  protected readonly filteredItems = computed(() => {
    const filters: LootFilters = {
      search: this.search().trim().toLowerCase(),
      category: this.selectedCategory(),
      members: this.selectedMembers(),
      stackable: this.selectedStackable(),
      minValue: this.minValue(),
      maxValue: this.maxValue(),
    };

    return LOOT_ITEMS.filter((item) => matchesFilters(item, filters));
  });

  protected readonly sortedItems = computed(() => {
    const field = this.sort.field();
    const multiplier = this.sort.multiplier();

    return [...this.filteredItems()].sort((a, b) => {
      let comparison = 0;

      if (field === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (field === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (field === 'marketValue') {
        comparison = a.marketValue - b.marketValue;
      } else if (field === 'membersOnly') {
        comparison = Number(a.membersOnly) - Number(b.membersOnly);
      }

      return comparison * multiplier;
    });
  });

  protected readonly paged = createPagedList(this.sortedItems);
  private readonly localizationService = inject(LocalizationService);
  private readonly marketValueFormatter = new Intl.NumberFormat('en-US');

  protected setSearch(value: string): void {
    this.search.set(value);
    this.paged.resetPage();
  }

  protected setCategory(value: LootCategory | ''): void {
    this.selectedCategory.set(value);
    this.paged.resetPage();
  }

  protected setMembers(value: MembersFilter): void {
    this.selectedMembers.set(value);
    this.paged.resetPage();
  }

  protected setStackable(value: StackableFilter): void {
    this.selectedStackable.set(value);
    this.paged.resetPage();
  }

  protected setMinValue(value: number | null): void {
    this.minValue.set(value);
    this.paged.resetPage();
  }

  protected setMaxValue(value: number | null): void {
    this.maxValue.set(value);
    this.paged.resetPage();
  }

  protected clearFilters(): void {
    this.search.set('');
    this.selectedCategory.set('');
    this.selectedMembers.set('');
    this.selectedStackable.set('');
    this.minValue.set(null);
    this.maxValue.set(null);
    this.sort.reset();
    this.paged.resetPage();
  }

  protected categoryLabel(category: LootCategory): string {
    const locale = this.localizationService.currentLocale();
    return CATEGORY_LABELS[category][locale];
  }

  protected formatMarketValue(value: number): string {
    return this.marketValueFormatter.format(value);
  }
}
