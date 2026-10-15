export const HIGHSCORE_VOCATIONS = ['knights', 'paladins', 'druids', 'sorcerers', 'monks'] as const;

export type TibiaHighscoresVocation = (typeof HIGHSCORE_VOCATIONS)[number];
