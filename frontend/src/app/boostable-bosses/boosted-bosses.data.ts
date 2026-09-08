export interface BoostedResistance {
  type: string;
  value: string;
}

export interface BoostedLootEntry {
  name: string;
  chance: string;
  notes?: string;
}

export interface BoostedBossDetailEntry {
  name: string;
  imageUrl?: string;
  shortDescription: string;
  accessQuest: string;
  location: string;
  soloLevel: string;
  groupLevel: string;
  attackStyle: string[];
  resistances: BoostedResistance[];
  loot: BoostedLootEntry[];
}

export const BOOSTED_BOSSES: BoostedBossDetailEntry[] = [
  {
    name: 'Lloyd',
    imageUrl: 'https://static.tibia.com/images/library/creatures/lloyd.gif',
    shortDescription:
      'Piracki boss nastawiony na obrazenia fizyczne i death, dobry do szybkiego sprawdzenia statusu pod glowna postac.',
    accessQuest: 'Brak specjalnego questa dostepowego.',
    location: 'Vandura, piracka forteca na Vandura.',
    soloLevel: '250+',
    groupLevel: '150+',
    attackStyle: ['mocne uderzenia fizyczne', 'obrazenia death', 'przywolania'],
    resistances: [
      { type: 'Physical', value: 'wysoka' },
      { type: 'Earth', value: 'srednia' },
      { type: 'Fire', value: 'niska' },
      { type: 'Ice', value: 'niska' },
    ],
    loot: [
      { name: 'platinum coin', chance: 'very common' },
      { name: 'great mana potion', chance: 'common' },
      { name: 'great health potion', chance: 'common' },
      { name: 'pirate boots', chance: 'uncommon' },
      { name: 'pirate shirt', chance: 'uncommon' },
      { name: 'ring of healing', chance: 'rare' },
      { name: 'gold ingot', chance: 'rare' },
      { name: 'small emerald', chance: 'rare' },
    ],
  },
];

export function findBoostedBossDetails(name: string | undefined): BoostedBossDetailEntry | null {
  if (!name) {
    return null;
  }

  return BOOSTED_BOSSES.find((entry) => entry.name === name) ?? null;
}
