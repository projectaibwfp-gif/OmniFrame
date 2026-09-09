import type { CreatureDetailDto, CreatureLootEntry } from '@shared/api-contract';

export type BoostedBossDetailEntry = CreatureDetailDto;

export const BOOSTED_BOSSES: BoostedBossDetailEntry[] = [
  {
    name: 'Lloyd',
    slug: 'Lloyd',
    imageUrl: 'https://static.tibia.com/images/library/creatures/lloyd.gif',
    boss: true,
    shortDescription:
      'Piracki boss nastawiony na obrazenia fizyczne i death, dobry do szybkiego sprawdzenia statusu pod glowna postac.',
    accessQuest: 'Brak specjalnego questa dostepowego.',
    location: 'Vandura, piracka forteca na Vandura.',
    soloLevel: '250+',
    groupLevel: '150+',
    attackStyle: ['mocne uderzenia fizyczne', 'obrazenia death', 'przywolania'],
    resistances: {
      physical: -50,
      earth: -20,
      fire: -10,
      ice: -10,
      energy: 0,
      holy: 0,
      death: 0,
    },
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

export type { CreatureLootEntry as BoostedLootEntry };
