export interface DetailLabels {
  back: string;
  notFound: string;
  notFoundAction: string;
  city: string;
  minLevel: string;
  category: string;
  description: string;
  spoiler: string;
  showSpoiler: string;
  hideSpoiler: string;
  rewards: string;
  main: string;
  side: string;
  daily: string;
  access: string;
}

// eslint-disable-next-line complexity
export function buildQuestDetailLabels(isPl: boolean): DetailLabels {
  return {
    back: isPl ? '← Wróć do listy' : '← Back to list',
    notFound: isPl ? 'Nie znaleziono questa' : 'Quest not found',
    notFoundAction: isPl ? 'Wróć do listy' : 'Back to list',
    city: isPl ? 'Miasto' : 'City',
    minLevel: isPl ? 'Min. poziom' : 'Min level',
    category: isPl ? 'Kategoria' : 'Category',
    description: isPl ? 'Opis' : 'Description',
    spoiler: isPl ? 'Spoiler' : 'Spoiler',
    showSpoiler: isPl ? 'Pokaż spoiler' : 'Show spoiler',
    hideSpoiler: isPl ? 'Ukryj spoiler' : 'Hide spoiler',
    rewards: isPl ? 'Nagrody' : 'Rewards',
    main: isPl ? 'Główny' : 'Main',
    side: isPl ? 'Poboczny' : 'Side',
    daily: isPl ? 'Dzienny' : 'Daily',
    access: isPl ? 'Dostęp' : 'Access',
  };
}
