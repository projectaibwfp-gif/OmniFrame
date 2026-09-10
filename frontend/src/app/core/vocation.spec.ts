import { describe, expect, it } from 'vitest';
import { vocationFromName } from './vocation';

describe('vocationFromName', () => {
  it('maps promoted vocations to hunting-place tabs', () => {
    expect(vocationFromName('Elite Knight')).toBe('Knight');
    expect(vocationFromName('Royal Paladin')).toBe('Paladin');
    expect(vocationFromName('Master Sorcerer')).toBe('Sorcerer');
  });

  it('returns null for missing or unsupported vocation', () => {
    expect(vocationFromName(null)).toBeNull();
    expect(vocationFromName('None')).toBeNull();
  });
});
