export interface HuntingLabels {
  eyebrow: string;
  title: string;
  intro: string;
  searchPlaceholder: string;
  teamhuntsTab: string;
  levelLabel: string;
  levelFrom: string;
  levelTo: string;
  accessLabel: string;
  allAccess: string;
  premiumAccess: string;
  freeAccess: string;
  weaponTypeLabel: string;
  allWeaponTypes: string;
  clearFilters: string;
  sortBy: string;
  sortName: string;
  sortMinLevel: string;
  found: string;
  perPage: string;
  placeColumn: string;
  vocations: string;
  exp: string;
  profit: string;
  previous: string;
  next: string;
  emptyTitle: string;
  emptyAction: string;
}

// eslint-disable-next-line complexity
export function buildHuntingLabels(isPl: boolean): HuntingLabels {
  return {
    eyebrow: 'Tibia',
    title: isPl ? 'Miejsca polowań' : 'Hunting places',
    intro: isPl
      ? 'Wyszukaj i przefiltruj miejsca polowań dopasowane do poziomu i profesji.'
      : 'Search and filter hunting places matching your level and vocation.',
    searchPlaceholder: isPl ? 'Szukaj miejsca...' : 'Search place...',
    teamhuntsTab: 'Teamhunts',
    levelLabel: isPl ? 'Poziom' : 'Level',
    levelFrom: isPl ? 'Od' : 'From',
    levelTo: isPl ? 'Do' : 'To',
    accessLabel: isPl ? 'Dostęp' : 'Access',
    allAccess: isPl ? 'Wszystkie' : 'All',
    premiumAccess: 'Premium',
    freeAccess: 'Free',
    weaponTypeLabel: isPl ? 'Typ broni' : 'Weapon type',
    allWeaponTypes: isPl ? 'Wszystkie' : 'All',
    clearFilters: isPl ? 'Wyczyść filtry' : 'Clear filters',
    sortBy: isPl ? 'Sortuj' : 'Sort',
    sortName: isPl ? 'Nazwa' : 'Name',
    sortMinLevel: isPl ? 'Poziom' : 'Level',
    found: isPl ? 'Znaleziono' : 'Found',
    perPage: isPl ? 'Na stronę' : 'Per page',
    placeColumn: isPl ? 'Miejsce' : 'Place',
    vocations: isPl ? 'Profesje' : 'Vocations',
    exp: isPl ? 'Raw EXP' : 'Raw EXP',
    profit: isPl ? 'Profit' : 'Profit',
    previous: isPl ? 'Poprzednia' : 'Previous',
    next: isPl ? 'Następna' : 'Next',
    emptyTitle: isPl
      ? 'Nie znaleziono miejsc polowań pasujących do filtrów.'
      : 'No hunting places match the selected filters.',
    emptyAction: isPl ? 'Wyczyść filtry' : 'Clear filters',
  };
}
