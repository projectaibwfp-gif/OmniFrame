import type { CreatureResistances } from '@shared/api-contract';

export const RESISTANCE_KEYS = [
  'physical',
  'fire',
  'ice',
  'energy',
  'earth',
  'holy',
  'death',
] as const satisfies readonly (keyof CreatureResistances)[];

/** Wartość procentowa, od której potwór jest całkowicie odporny na dany żywioł. */
const IMMUNE_RESISTANCE_THRESHOLD = -100;
const NEUTRAL_RESISTANCE = 0;

export interface ResistanceEntry {
  label: string;
  value: number;
}

export function buildResistanceEntries(resistances: CreatureResistances): ResistanceEntry[] {
  return RESISTANCE_KEYS.map((key) => ({ label: key, value: resistances[key] }));
}

export function resistanceClass(value: number): string {
  if (value <= IMMUNE_RESISTANCE_THRESHOLD) {
    return 'resist-immune';
  }
  if (value < NEUTRAL_RESISTANCE) {
    return 'resist-strong';
  }
  if (value > NEUTRAL_RESISTANCE) {
    return 'resist-weak';
  }
  return 'resist-neutral';
}
