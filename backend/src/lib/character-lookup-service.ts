import type { TibiaCharacterLookupDto } from '@shared/api-contract';
import {
  getFreshCharacterSnapshot,
  getLatestCharacterSnapshot,
  listCharacterLookupHistory,
  saveCharacterLookup,
} from './character-lookups';
import { fetchCharacter } from './tibiadata';

const DEFAULT_SNAPSHOT_TTL_MINUTES = 15;
const SECONDS_PER_MINUTE = 60;

export type CharacterLookupStorageStage = 'save' | 'history';

/** A live TibiaData lookup succeeded but persisting or reading its history failed. */
export class CharacterLookupStorageError extends Error {
  constructor(
    readonly stage: CharacterLookupStorageStage,
    cause: unknown,
  ) {
    super(`Character lookup ${stage} failed`, { cause });
    this.name = 'CharacterLookupStorageError';
  }
}

function getSnapshotTtlSeconds(): number {
  const raw = process.env.CHARACTER_SNAPSHOT_TTL_MINUTES?.trim();
  const ttlMinutes = raw ? Number(raw) : Number.NaN;
  if (!Number.isFinite(ttlMinutes) || ttlMinutes < 0) {
    return DEFAULT_SNAPSHOT_TTL_MINUTES * SECONDS_PER_MINUTE;
  }
  return Math.floor(ttlMinutes * SECONDS_PER_MINUTE);
}

async function withStorageStage<T>(
  stage: CharacterLookupStorageStage,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw new CharacterLookupStorageError(stage, error);
  }
}

async function findFreshCharacterLookup(
  characterName: string,
): Promise<TibiaCharacterLookupDto | null> {
  const snapshotTtlSeconds = getSnapshotTtlSeconds();
  if (snapshotTtlSeconds <= 0) {
    return null;
  }

  const character = await getFreshCharacterSnapshot(characterName, snapshotTtlSeconds);
  if (!character) {
    return null;
  }

  return { character, history: await listCharacterLookupHistory(characterName) };
}

async function fetchLiveCharacterLookup(
  characterName: string,
  requestedBySub: string | null,
): Promise<TibiaCharacterLookupDto> {
  const character = await fetchCharacter(characterName);
  await withStorageStage('save', () =>
    saveCharacterLookup(character, characterName, requestedBySub),
  );
  const history = await withStorageStage('history', () =>
    listCharacterLookupHistory(characterName),
  );
  return { character, history };
}

/**
 * Returns a fresh stored snapshot when one exists, otherwise fetches the character
 * from TibiaData and records the lookup. Throws `CharacterLookupStorageError` when
 * the live lookup cannot be persisted.
 */
export async function lookupCharacter(
  characterName: string,
  requestedBySub: string | null,
): Promise<TibiaCharacterLookupDto> {
  return (
    (await findFreshCharacterLookup(characterName)) ??
    (await fetchLiveCharacterLookup(characterName, requestedBySub))
  );
}

export async function findLatestCharacterLookup(
  characterName: string,
): Promise<TibiaCharacterLookupDto | null> {
  const character = await getLatestCharacterSnapshot(characterName);
  if (!character) {
    return null;
  }

  return { character, history: await listCharacterLookupHistory(characterName) };
}
