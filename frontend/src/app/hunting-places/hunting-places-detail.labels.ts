export interface DetailLabels {
  back: string;
  notFound: string;
  notFoundAction: string;
  level: string;
  city: string;
  access: string;
  premium: string;
  free: string;
  profit: string;
  experience: string;
  creatures: string;
  vocations: string;
  description: string;
  map: string;
  low: string;
  medium: string;
  high: string;
}

// eslint-disable-next-line complexity
export function buildHuntingDetailLabels(isPl: boolean): DetailLabels {
  return {
    back: isPl ? '← Wróć do listy' : '← Back to list',
    notFound: isPl ? 'Nie znaleziono miejsca' : 'Place not found',
    notFoundAction: isPl ? 'Wróć do listy' : 'Back to list',
    level: isPl ? 'Poziom' : 'Level',
    city: isPl ? 'Miasto' : 'City',
    access: isPl ? 'Dostęp' : 'Access',
    premium: isPl ? 'Premium' : 'Premium',
    free: isPl ? 'Darmowy' : 'Free',
    profit: isPl ? 'Profit' : 'Profit',
    experience: isPl ? 'EXP' : 'EXP',
    creatures: isPl ? 'Potwory' : 'Creatures',
    vocations: isPl ? 'Profesje' : 'Vocations',
    description: isPl ? 'Opis' : 'Description',
    map: isPl ? 'Lokalizacja na mapie' : 'Location on map',
    low: isPl ? 'Niski' : 'Low',
    medium: isPl ? 'Średni' : 'Medium',
    high: isPl ? 'Wysoki' : 'High',
  };
}
