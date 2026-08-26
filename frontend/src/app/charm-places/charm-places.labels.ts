export interface CharmLabels {
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
export function buildCharmLabels(isPl: boolean): CharmLabels {
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
