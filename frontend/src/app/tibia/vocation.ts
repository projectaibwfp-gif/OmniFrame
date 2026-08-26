export type Vocation = 'Knight' | 'Paladin' | 'Druid' | 'Sorcerer' | 'Monk';

export const VOCATIONS: Vocation[] = ['Knight', 'Paladin', 'Druid', 'Sorcerer', 'Monk'];

const VOCATION_CLASSES: Record<Vocation, string> = {
  Knight: 'vocation-knight',
  Paladin: 'vocation-paladin',
  Druid: 'vocation-druid',
  Sorcerer: 'vocation-sorcerer',
  Monk: 'vocation-monk',
};

export function vocationClass(vocation: Vocation): string {
  return VOCATION_CLASSES[vocation];
}
