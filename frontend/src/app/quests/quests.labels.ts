export interface QuestLabels {
  eyebrow: string;
  title: string;
  intro: string;
  searchPlaceholder: string;
  allCities: string;
  allCategories: string;
  cityLabel: string;
  categoryLabel: string;
  clearFilters: string;
  sortBy: string;
  sortName: string;
  sortCity: string;
  sortLevel: string;
  sortCategory: string;
  found: string;
  perPage: string;
  category: string;
  minLevel: string;
  previous: string;
  next: string;
  emptyTitle: string;
  emptyAction: string;
  main: string;
  side: string;
  daily: string;
  access: string;
}

// eslint-disable-next-line complexity
export function buildQuestLabels(isPl: boolean): QuestLabels {
  return {
    eyebrow: 'Tibia',
    title: isPl ? 'Questy' : 'Quests',
    intro: isPl
      ? 'Przeglądaj questy, sprawdź wymagania i odkryj spoilery wykonania.'
      : 'Browse quests, check requirements and discover walkthrough spoilers.',
    searchPlaceholder: isPl ? 'Szukaj questa...' : 'Search quest...',
    allCities: isPl ? 'Wszystkie' : 'All',
    allCategories: isPl ? 'Wszystkie' : 'All',
    cityLabel: isPl ? 'Miasto' : 'City',
    categoryLabel: isPl ? 'Kategoria' : 'Category',
    clearFilters: isPl ? 'Wyczyść filtry' : 'Clear filters',
    sortBy: isPl ? 'Sortuj' : 'Sort',
    sortName: isPl ? 'Nazwa' : 'Name',
    sortCity: isPl ? 'Miasto' : 'City',
    sortLevel: isPl ? 'Poziom' : 'Level',
    sortCategory: isPl ? 'Kategoria' : 'Category',
    found: isPl ? 'Znaleziono' : 'Found',
    perPage: isPl ? 'Na stronę' : 'Per page',
    category: isPl ? 'Kategoria' : 'Category',
    minLevel: isPl ? 'Min. poziom' : 'Min level',
    previous: isPl ? 'Poprzednia' : 'Previous',
    next: isPl ? 'Następna' : 'Next',
    emptyTitle: isPl
      ? 'Nie znaleziono questów pasujących do filtrów.'
      : 'No quests match the selected filters.',
    emptyAction: isPl ? 'Wyczyść filtry' : 'Clear filters',
    main: isPl ? 'Główny' : 'Main',
    side: isPl ? 'Poboczny' : 'Side',
    daily: isPl ? 'Dzienny' : 'Daily',
    access: isPl ? 'Dostęp' : 'Access',
  };
}
