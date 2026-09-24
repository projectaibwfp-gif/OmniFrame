import type { CreatureDetailDto } from '@shared/api-contract';

export type BoostedCreatureDetailEntry = CreatureDetailDto;

export const BOOSTED_CREATURES: BoostedCreatureDetailEntry[] = [
  {
    name: 'Dragon Lord',
    slug: 'Dragon-Lord',
    imageUrl: 'https://static.tibia.com/images/library/dragonlord.gif',
    boss: false,
    shortDescription:
      'Klasyczny fire caster z mocnym melee, dobry kandydat do oznaczania czy glowna postac ma go juz zrobionego.',
    accessQuest: 'Brak specjalnego tego dostepowego.',
    location: 'Fenrock, Darashia Dragon Lair, PoH, okolice Yalahar.',
    soloLevel: '70+',
    groupLevel: '45+',
    attackStyle: ['fire wave', 'fire bomb', 'mocny melee'],
    resistances: {
      physical: 0,
      fire: -90,
      ice: 10,
      energy: 0,
      earth: 0,
      holy: 0,
      death: 0,
    },
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

/**
 * Creatures don't change their library image over time - prefer the curated,
 * already-verified `imageUrl` over whatever TibiaData returns for the same
 * name, and only fall back to the API value for creatures we haven't curated
 * yet.
 */
export function resolveCreatureImageUrl(name: string, apiImageUrl: string): string {
  const match = BOOSTED_CREATURES.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
  return match?.imageUrl ?? apiImageUrl;
}
