export interface CreatureDetailLabels {
  back: string;
  overview: string;
  health: string;
  experience: string;
  charmPoints: string;
  boss: string;
  creature: string;
  resistances: string;
  attackStyle: string;
  loot: string;
  location: string;
  accessQuest: string;
  soloLevel: string;
  groupLevel: string;
  droppedItems: string;
  huntingPlaces: string;
  marketValue: string;
  notFound: string;
  notFoundAction: string;
  noData: string;
}

const POLISH_LABELS: CreatureDetailLabels = {
  back: '← Wroc',
  overview: 'Przeglad',
  health: 'HP',
  experience: 'EXP',
  charmPoints: 'Charm points',
  boss: 'Boss',
  creature: 'Potwor',
  resistances: 'Odpornosci',
  attackStyle: 'Jak atakuje',
  loot: 'Loot',
  location: 'Gdzie wystepuje',
  accessQuest: 'Quest dostepowy',
  soloLevel: 'Poziom solo',
  groupLevel: 'Poziom group',
  droppedItems: 'Dropowane itemy',
  huntingPlaces: 'Miejsca polowan',
  marketValue: 'Market value',
  notFound: 'Nie znaleziono potwora.',
  notFoundAction: 'Wroc do listy',
  noData: 'Brak szczegolowych danych dla tego potwora.',
};

const ENGLISH_LABELS: CreatureDetailLabels = {
  back: '← Back',
  overview: 'Overview',
  health: 'HP',
  experience: 'EXP',
  charmPoints: 'Charm points',
  boss: 'Boss',
  creature: 'Creature',
  resistances: 'Resistances',
  attackStyle: 'Attack style',
  loot: 'Loot',
  location: 'Where it spawns',
  accessQuest: 'Access quest',
  soloLevel: 'Solo level',
  groupLevel: 'Group level',
  droppedItems: 'Dropped items',
  huntingPlaces: 'Hunting places',
  marketValue: 'Market value',
  notFound: 'Creature not found.',
  notFoundAction: 'Back to list',
  noData: 'No detailed data for this creature.',
};

export function buildCreatureDetailLabels(isPl: boolean): CreatureDetailLabels {
  return isPl ? POLISH_LABELS : ENGLISH_LABELS;
}
