export interface HuntingLabels {
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

// eslint-disable-next-line complexity
export function buildHuntingLabels(isPl: boolean): HuntingLabels {
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
