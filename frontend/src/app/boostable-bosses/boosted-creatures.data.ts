import type { BoostedLootEntry, BoostedResistance } from './boosted-bosses.data';

export interface BoostedCreatureDetailEntry {
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

export const BOOSTED_CREATURES: BoostedCreatureDetailEntry[] = [
  {
    name: 'Dragon Lord',
    imageUrl: 'https://static.tibia.com/images/library/creatures/dragonlord.gif',
    shortDescription:
      'Klasyczny fire caster z mocnym melee, dobry kandydat do oznaczania czy glowna postac ma go juz zrobionego.',
    accessQuest: 'Brak specjalnego questa dostepowego.',
    location: 'Fenrock, Darashia Dragon Lair, PoH, okolice Yalahar.',
    soloLevel: '70+',
    groupLevel: '45+',
    attackStyle: ['fire wave', 'fire bomb', 'mocny melee'],
    resistances: [
      { type: 'Fire', value: 'bardzo wysoka' },
      { type: 'Ice', value: 'slaba' },
      { type: 'Energy', value: 'neutralna' },
      { type: 'Physical', value: 'neutralna' },
    ],
    loot: [
      { name: 'dragon ham', chance: 'very common' },
      { name: 'strong health potion', chance: 'common' },
      { name: 'wand of inferno', chance: 'uncommon' },
      { name: 'tower shield', chance: 'uncommon' },
      { name: 'dragon robe', chance: 'rare' },
      { name: 'royal helmet', chance: 'rare' },
      { name: 'green dragon leather', chance: 'rare' },
    ],
  },
];

export function findBoostedCreatureDetails(
  name: string | undefined,
): BoostedCreatureDetailEntry | null {
  if (!name) {
    return null;
  }

  return BOOSTED_CREATURES.find((entry) => entry.name === name) ?? null;
}
