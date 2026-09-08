import type { LootCategory } from './loot.data';

export interface LootLabels {
  eyebrow: string;
  title: string;
  intro: string;
  searchLabel: string;
  searchPlaceholder: string;
  categoryLabel: string;
  allCategories: string;
  membersLabel: string;
  allAccess: string;
  membersOnly: string;
  freeAndMembers: string;
  stackableLabel: string;
  allStackability: string;
  stackableOnly: string;
  nonStackableOnly: string;
  minValueLabel: string;
  maxValueLabel: string;
  clearFilters: string;
  sortBy: string;
  sortName: string;
  sortCategory: string;
  sortMarketValue: string;
  sortMembers: string;
  found: string;
  perPage: string;
  previous: string;
  next: string;
  emptyTitle: string;
  emptyAction: string;
  marketValue: string;
  category: string;
  sources: string;
  stackable: string;
  access: string;
  yes: string;
  no: string;
  staticDataNote: string;
}

export const CATEGORY_LABELS: Record<LootCategory, { pl: string; en: string }> = {
  weapons: { pl: 'Bronie', en: 'Weapons' },
  armor: { pl: 'Pancerze', en: 'Armor' },
  helmets: { pl: 'Helmy', en: 'Helmets' },
  legs: { pl: 'Legi', en: 'Legs' },
  boots: { pl: 'Buty', en: 'Boots' },
  accessories: { pl: 'Akcesoria', en: 'Accessories' },
  runes: { pl: 'Runy', en: 'Runes' },
  'creature-products': { pl: 'Produkty potworow', en: 'Creature products' },
  valuables: { pl: 'Kosztownosci', en: 'Valuables' },
};

// eslint-disable-next-line complexity
export function buildLootLabels(isPl: boolean): LootLabels {
  return {
    eyebrow: 'Tibia',
    title: isPl ? 'Loot' : 'Loot',
    intro: isPl
      ? 'Pelna zakladka z itemami podzielonymi na kategorie, z filtrowaniem, wyszukiwaniem i orientacyjnym market value.'
      : 'A full loot tab with categorized items, filtering, search and estimated market value.',
    searchLabel: isPl ? 'Szukaj' : 'Search',
    searchPlaceholder: isPl ? 'Szukaj itemu lub zrodla...' : 'Search item or source...',
    categoryLabel: isPl ? 'Kategoria' : 'Category',
    allCategories: isPl ? 'Wszystkie' : 'All',
    membersLabel: isPl ? 'Dostep' : 'Access',
    allAccess: isPl ? 'Wszystkie' : 'All',
    membersOnly: isPl ? 'Tylko PACC' : 'Members only',
    freeAndMembers: isPl ? 'Free i PACC' : 'Free and members',
    stackableLabel: isPl ? 'Stackowalnosc' : 'Stackability',
    allStackability: isPl ? 'Dowolna' : 'Any',
    stackableOnly: isPl ? 'Tylko stackowalne' : 'Stackable only',
    nonStackableOnly: isPl ? 'Tylko niestackowalne' : 'Non-stackable only',
    minValueLabel: isPl ? 'Min. value' : 'Min value',
    maxValueLabel: isPl ? 'Max. value' : 'Max value',
    clearFilters: isPl ? 'Wyczysc filtry' : 'Clear filters',
    sortBy: isPl ? 'Sortuj' : 'Sort',
    sortName: isPl ? 'Nazwa' : 'Name',
    sortCategory: isPl ? 'Kategoria' : 'Category',
    sortMarketValue: isPl ? 'Market value' : 'Market value',
    sortMembers: isPl ? 'Dostep' : 'Access',
    found: isPl ? 'Znaleziono' : 'Found',
    perPage: isPl ? 'Na strone' : 'Per page',
    previous: isPl ? 'Poprzednia' : 'Previous',
    next: isPl ? 'Nastepna' : 'Next',
    emptyTitle: isPl
      ? 'Nie znaleziono itemow pasujacych do wybranych filtrow.'
      : 'No items match the selected filters.',
    emptyAction: isPl ? 'Wyczysc filtry' : 'Clear filters',
    marketValue: isPl ? 'Market value' : 'Market value',
    category: isPl ? 'Kategoria' : 'Category',
    sources: isPl ? 'Zrodla' : 'Sources',
    stackable: isPl ? 'Stackowalny' : 'Stackable',
    access: isPl ? 'Dostep' : 'Access',
    yes: isPl ? 'Tak' : 'Yes',
    no: isPl ? 'Nie' : 'No',
    staticDataNote: isPl
      ? 'Dane sa obecnie statyczne i przygotowane pod przyszle podpienie API.'
      : 'Data is currently static and prepared for future API integration.',
  };
}
