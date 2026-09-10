import type { Vocation } from '../tibia/vocation';

const VOCATION_SHORT_CODES: Record<string, string> = {
  'elite knight': 'EK',
  knight: 'K',
  'master sorcerer': 'MS',
  sorcerer: 'S',
  'elder druid': 'ED',
  druid: 'D',
  'royal paladin': 'RP',
  paladin: 'P',
  monk: 'M',
  'exalted monk': 'EM',
  none: 'N',
};

const FALLBACK_VOCATION_CODE = '?';
const VOCATION_NAMES: Record<string, Vocation> = {
  knight: 'Knight',
  'elite knight': 'Knight',
  paladin: 'Paladin',
  'royal paladin': 'Paladin',
  druid: 'Druid',
  'elder druid': 'Druid',
  sorcerer: 'Sorcerer',
  'master sorcerer': 'Sorcerer',
  monk: 'Monk',
  'exalted monk': 'Monk',
};

export function shortVocation(vocation: string | null | undefined): string {
  if (!vocation) {
    return FALLBACK_VOCATION_CODE;
  }
  const normalized = vocation.trim().toLowerCase();
  return VOCATION_SHORT_CODES[normalized] ?? vocation.charAt(0).toUpperCase();
}

export function vocationFromName(vocation: string | null | undefined): Vocation | null {
  return VOCATION_NAMES[vocation?.trim().toLowerCase() ?? ''] ?? null;
}

export function formatMainCharacterBadge(
  vocation: string | null | undefined,
  level: number | null | undefined,
): string {
  const code = shortVocation(vocation);
  const displayLevel = typeof level === 'number' && level > 0 ? level : '?';
  return `${code}${displayLevel}`;
}
