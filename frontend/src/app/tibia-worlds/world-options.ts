import type { TibiaWorldOverviewDto } from '@shared/api-contract';

/**
 * TibiaData pomija świat postaci w liście światów regularnych (np. świat turniejowy
 * albo świeżo otwarty), a użytkownik musi móc go wybrać - dlatego dopinamy go na koniec.
 */
export function buildWorldOptions(
  regularWorlds: readonly TibiaWorldOverviewDto[],
  mainCharacterWorld: string | null,
): string[] {
  const worldNames = regularWorlds.map((world) => world.name);

  if (!mainCharacterWorld || worldNames.includes(mainCharacterWorld)) {
    return worldNames;
  }

  return [...worldNames, mainCharacterWorld];
}
