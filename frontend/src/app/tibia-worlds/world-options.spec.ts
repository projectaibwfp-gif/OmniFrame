import { describe, expect, it } from 'vitest';
import type { TibiaWorldOverviewDto } from '@shared/api-contract';
import { buildWorldOptions } from './world-options';

function buildWorld(name: string): TibiaWorldOverviewDto {
  return {
    battleyeDate: null,
    battleyeProtected: true,
    gameWorldType: 'regular',
    location: 'Europe',
    name,
    playersOnline: 0,
    premiumOnly: false,
    pvpType: 'Open PvP',
    status: 'online',
    tournamentWorldType: null,
    transferType: null,
  };
}

describe('buildWorldOptions', () => {
  it('returns the regular world names when no main character world is set', () => {
    const options = buildWorldOptions([buildWorld('Antica'), buildWorld('Secura')], null);

    expect(options).toEqual(['Antica', 'Secura']);
  });

  it('does not duplicate a main character world already present on the list', () => {
    const options = buildWorldOptions([buildWorld('Antica'), buildWorld('Dia')], 'Dia');

    expect(options).toEqual(['Antica', 'Dia']);
  });

  it('appends a main character world missing from the regular list', () => {
    const options = buildWorldOptions([buildWorld('Antica')], 'Zuna');

    expect(options).toEqual(['Antica', 'Zuna']);
  });
});
