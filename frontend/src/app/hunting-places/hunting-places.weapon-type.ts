import type { HuntingMonster, HuntingPlace } from './hunting-places.data';

export type WeaponElement = 'physical' | 'fire' | 'ice' | 'energy' | 'earth' | 'death';

export const WEAPON_ELEMENTS: WeaponElement[] = [
  'physical',
  'fire',
  'ice',
  'energy',
  'earth',
  'death',
];

const TIE_THRESHOLD_PERCENT = 10;

/**
 * Nie ma tego pola w scrapie. Wyliczamy element ataku z odporności potworów
 * w miejscu: element(y), na który potwory są najsłabsze (najwyższa średnia
 * odporność), to sugerowany typ broni/many (amunicja, runy, mastery).
 */
export function weaponTypesForPlace(place: HuntingPlace): WeaponElement[] {
  const monsters = place.monsters;
  if (monsters.length === 0) {
    return [];
  }

  const averages = WEAPON_ELEMENTS.map((element) => ({
    element,
    average: averageResistance(monsters, element),
  }));

  const maxAverage = Math.max(...averages.map((entry) => entry.average));
  if (maxAverage <= 0) {
    return ['physical'];
  }

  return averages
    .filter((entry) => entry.average > 0 && entry.average >= maxAverage - TIE_THRESHOLD_PERCENT)
    .sort((a, b) => b.average - a.average)
    .map((entry) => entry.element);
}

function averageResistance(monsters: HuntingMonster[], element: WeaponElement): number {
  const total = monsters.reduce((sum, monster) => sum + monster.resistances[element], 0);
  return total / monsters.length;
}
