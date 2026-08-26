export interface DetailLabels {
  back: string;
  notFound: string;
  notFoundAction: string;
  creature: string;
  place: string;
  city: string;
  minLevel: string;
  vocations: string;
  description: string;
  map: string;
}

// eslint-disable-next-line complexity
export function buildCharmDetailLabels(isPl: boolean): DetailLabels {
  return {
    back: isPl ? '← Wróć do listy' : '← Back to list',
    notFound: isPl ? 'Nie znaleziono miejsca' : 'Place not found',
    notFoundAction: isPl ? 'Wróć do listy' : 'Back to list',
    creature: isPl ? 'Potwór' : 'Creature',
    place: isPl ? 'Miejsce' : 'Place',
    city: isPl ? 'Miasto' : 'City',
    minLevel: isPl ? 'Min. poziom' : 'Min level',
    vocations: isPl ? 'Profesje' : 'Vocations',
    description: isPl ? 'Opis' : 'Description',
    map: isPl ? 'Lokalizacja na mapie' : 'Location on map',
  };
}
