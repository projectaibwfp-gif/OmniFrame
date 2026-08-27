export interface DetailLabels {
  back: string;
  notFound: string;
  notFoundAction: string;
  level: string;
  access: string;
  premium: string;
  free: string;
  rawExp: string;
  profit: string;
  vocations: string;
  monsters: string;
  health: string;
  charmPoints: string;
  resistances: string;
  requirements: string;
  quests: string;
  imbuements: string;
  trinkets: string;
  valuableDrop: string;
  map: string;
}

// eslint-disable-next-line complexity
export function buildHuntingDetailLabels(isPl: boolean): DetailLabels {
  return {
    back: isPl ? '← Wróć do listy' : '← Back to list',
    notFound: isPl ? 'Nie znaleziono miejsca' : 'Place not found',
    notFoundAction: isPl ? 'Wróć do listy' : 'Back to list',
    level: isPl ? 'Poziom' : 'Level',
    access: isPl ? 'Dostęp' : 'Access',
    premium: isPl ? 'Premium' : 'Premium',
    free: isPl ? 'Darmowy' : 'Free',
    rawExp: 'Raw EXP',
    profit: isPl ? 'Profit' : 'Profit',
    vocations: isPl ? 'Profesje' : 'Vocations',
    monsters: isPl ? 'Potwory' : 'Monsters',
    health: isPl ? 'HP' : 'HP',
    charmPoints: isPl ? 'Punkty charmu' : 'Charm points',
    resistances: isPl ? 'Odporności' : 'Resistances',
    requirements: isPl ? 'Wymagania trasy' : 'Route requirements',
    quests: isPl ? 'Questy' : 'Quests',
    imbuements: isPl ? 'Rekomendowane imbuingi' : 'Recommended imbuements',
    trinkets: isPl ? 'Trinkety' : 'Trinkets',
    valuableDrop: isPl ? 'Wartościowy drop' : 'Valuable drop',
    map: isPl ? 'Lokalizacja na mapie' : 'Location on map',
  };
}
