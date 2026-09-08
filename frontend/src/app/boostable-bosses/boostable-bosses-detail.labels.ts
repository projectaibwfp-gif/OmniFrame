export interface BoostedDetailLabels {
  back: string;
  currentTarget: string;
  overview: string;
  description: string;
  accessQuest: string;
  location: string;
  soloLevel: string;
  groupLevel: string;
  attackStyle: string;
  resistances: string;
  loot: string;
  lootChance: string;
  noDetails: string;
  boss: string;
  creature: string;
  progress: string;
  firstTime: string;
  completed: string;
  saveError: string;
  saveSuccess: string;
  noMainCharacter: string;
}

const POLISH_LABELS: BoostedDetailLabels = {
  back: '← Wroc do boosted',
  currentTarget: 'Aktualny typ',
  overview: 'Przeglad',
  description: 'Opis',
  accessQuest: 'Quest dostepowy',
  location: 'Gdzie wystepuje',
  soloLevel: 'Poziom solo',
  groupLevel: 'Poziom group',
  attackStyle: 'Jak atakuje',
  resistances: 'Odpornosci',
  loot: 'Loot',
  lootChance: 'Szansa',
  noDetails: 'Brak szczegolowych danych dla tego wpisu.',
  boss: 'Boss',
  creature: 'Potwor',
  progress: 'Status dla glownej postaci',
  firstTime: 'Pierwszy raz',
  completed: 'Juz robione',
  saveError: 'Nie udalo sie zapisac statusu.',
  saveSuccess: 'Status zapisany.',
  noMainCharacter: 'Najpierw ustaw glowna postac w profilu.',
};

const ENGLISH_LABELS: BoostedDetailLabels = {
  back: '← Back to boosted',
  currentTarget: 'Current type',
  overview: 'Overview',
  description: 'Description',
  accessQuest: 'Access quest',
  location: 'Where it spawns',
  soloLevel: 'Solo level',
  groupLevel: 'Group level',
  attackStyle: 'Attack style',
  resistances: 'Resistances',
  loot: 'Loot',
  lootChance: 'Chance',
  noDetails: 'No detailed data for this entry.',
  boss: 'Boss',
  creature: 'Creature',
  progress: 'Main character status',
  firstTime: 'First time',
  completed: 'Already done',
  saveError: 'Could not save status.',
  saveSuccess: 'Status saved.',
  noMainCharacter: 'Link your main character first in profile.',
};

export function buildBoostedDetailLabels(isPl: boolean): BoostedDetailLabels {
  return isPl ? POLISH_LABELS : ENGLISH_LABELS;
}
