export interface NewsLabels {
  eyebrow: string;
  title: string;
  intro: string;
  searchPlaceholder: string;
  categoryLabel: string;
  allCategories: string;
  allTypes: string;
  typeLabel: string;
  clearFilters: string;
  sortBy: string;
  sortDate: string;
  sortTitle: string;
  sortCategory: string;
  found: string;
  perPage: string;
  previous: string;
  next: string;
  emptyTitle: string;
  emptyAction: string;
  readMore: string;
  cachedAt: string;
  error: string;
  retry: string;
}

// eslint-disable-next-line complexity
export function buildNewsLabels(isPl: boolean): NewsLabels {
  return {
    eyebrow: 'Tibia',
    title: isPl ? 'Aktualności' : 'News',
    intro: isPl
      ? 'Najnowsze newsy i aktualności z oficjalnej strony Tibia.'
      : 'Latest news and updates from the official Tibia website.',
    searchPlaceholder: isPl ? 'Szukaj newsa...' : 'Search news...',
    categoryLabel: isPl ? 'Kategoria' : 'Category',
    allCategories: isPl ? 'Wszystkie' : 'All',
    allTypes: isPl ? 'Wszystkie' : 'All',
    typeLabel: isPl ? 'Typ' : 'Type',
    clearFilters: isPl ? 'Wyczyść filtry' : 'Clear filters',
    sortBy: isPl ? 'Sortuj' : 'Sort',
    sortDate: isPl ? 'Data' : 'Date',
    sortTitle: isPl ? 'Tytuł' : 'Title',
    sortCategory: isPl ? 'Kategoria' : 'Category',
    found: isPl ? 'Znaleziono' : 'Found',
    perPage: isPl ? 'Na stronę' : 'Per page',
    previous: isPl ? 'Poprzednia' : 'Previous',
    next: isPl ? 'Następna' : 'Next',
    emptyTitle: isPl ? 'Nie znaleziono newsów.' : 'No news found.',
    emptyAction: isPl ? 'Wyczyść filtry' : 'Clear filters',
    readMore: isPl ? 'Czytaj więcej' : 'Read more',
    cachedAt: isPl ? 'Cache z' : 'Cached at',
    error: isPl ? 'Nie udało się załadować newsów.' : 'Could not load news.',
    retry: isPl ? 'Spróbuj ponownie' : 'Try again',
  };
}
