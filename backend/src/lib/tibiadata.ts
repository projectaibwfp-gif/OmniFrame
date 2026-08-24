import type {
  BoostableBossDto,
  BoostableBossesDto,
  TibiaCharacterAchievementDto,
  TibiaCharacterDto,
  TibiaCharacterExperienceDto,
  TibiaCreatureDto,
  TibiaCreaturesDto,
  TibiaCharacterOtherCharacterDto,
} from '@shared/api-contract';
import { saveHighscoresSnapshots } from './highscores-snapshots';

const DEFAULT_TIBIA_DATA_API_BASE_URL = 'https://api.tibiadata.com/v4';

export const TIBIA_DATA_API_BASE_URL =
  process.env.TIBIA_DATA_API_BASE_URL?.trim() || DEFAULT_TIBIA_DATA_API_BASE_URL;

interface TibiaDataBoostableBoss {
  name?: unknown;
  image_url?: unknown;
  featured?: unknown;
}

interface TibiaDataBoostableBossesResponse {
  boostable_bosses?: {
    boosted?: TibiaDataBoostableBoss;
    boostable_boss_list?: TibiaDataBoostableBoss[];
  };
}

interface TibiaDataCreature {
  name?: unknown;
  race?: unknown;
  image_url?: unknown;
  featured?: unknown;
}

interface TibiaDataCreaturesResponse {
  creatures?: {
    boosted?: TibiaDataCreature;
    creature_list?: TibiaDataCreature[];
  };
}

interface TibiaDataCharacterInfo {
  name?: unknown;
  sex?: unknown;
  title?: unknown;
  vocation?: unknown;
  level?: unknown;
  achievement_points?: unknown;
  world?: unknown;
  residence?: unknown;
  married_to?: unknown;
  last_login?: unknown;
  account_status?: unknown;
  unlocked_titles?: unknown;
  comment?: unknown;
  former_names?: unknown;
  former_worlds?: unknown;
  guild?: unknown;
}

interface TibiaDataCharacterAchievement {
  name?: unknown;
  grade?: unknown;
  secret?: unknown;
}

interface TibiaDataOtherCharacter {
  name?: unknown;
  world?: unknown;
  status?: unknown;
  deleted?: unknown;
  main?: unknown;
  traded?: unknown;
}

interface TibiaDataAccountInformation {
  created?: unknown;
  loyalty_title?: unknown;
}

interface TibiaDataCharacterContainer {
  character?: TibiaDataCharacterInfo;
  achievements?: TibiaDataCharacterAchievement[];
  other_characters?: TibiaDataOtherCharacter[];
  account_information?: TibiaDataAccountInformation;
}

interface TibiaDataInformation {
  status?: {
    http_code?: unknown;
  };
}

interface TibiaDataCharacterResponse {
  character?: TibiaDataCharacterContainer;
  information?: TibiaDataInformation;
}

interface TibiaDataHighscoreEntry {
  name?: unknown;
  rank?: unknown;
  vocation?: unknown;
  world?: unknown;
  level?: unknown;
  value?: unknown;
}

interface TibiaDataHighscorePage {
  total_pages?: unknown;
}

interface TibiaDataHighscoresPayload {
  highscore_age?: unknown;
  highscore_list?: TibiaDataHighscoreEntry[];
  highscore_page?: TibiaDataHighscorePage;
}

interface TibiaDataHighscoresResponse {
  highscores?: TibiaDataHighscoresPayload;
  information?: {
    status?: {
      error?: unknown;
      message?: unknown;
    };
  };
}

type JsonRecord = Record<string, unknown>;
const MAX_HIGHSCORE_PAGES = 20;
const RESTRICTION_MODE_ERROR_CODE = 9002;

type TibiaHighscoresVocation = 'all' | 'knights' | 'paladins' | 'druids' | 'sorcerers';

export class TibiaDataNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TibiaDataNotFoundError';
  }
}

class TibiaDataRestrictionModeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TibiaDataRestrictionModeError';
  }
}

function mapBoss(boss: TibiaDataBoostableBoss | undefined): BoostableBossDto | null {
  if (!boss) {
    return null;
  }

  if (typeof boss.name !== 'string' || typeof boss.image_url !== 'string') {
    return null;
  }

  return {
    name: boss.name,
    imageUrl: boss.image_url,
    featured: boss.featured === true,
  };
}

function mapCreature(creature: TibiaDataCreature | undefined): TibiaCreatureDto | null {
  if (!creature) {
    return null;
  }

  if (
    typeof creature.name !== 'string' ||
    typeof creature.race !== 'string' ||
    typeof creature.image_url !== 'string'
  ) {
    return null;
  }

  return {
    name: creature.name,
    race: creature.race,
    imageUrl: creature.image_url,
    featured: creature.featured === true,
  };
}

function asRecord(value: unknown): JsonRecord | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as JsonRecord;
  }

  return null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function readBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function mapAchievements(value: unknown): TibiaCharacterAchievementDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => asRecord(item))
    .filter((item): item is JsonRecord => item !== null)
    .map((item) => ({
      name: readString(item['name']) ?? '',
      grade: readNumber(item['grade']),
      secret: readBoolean(item['secret']) === true,
    }))
    .filter((item) => item.name.length > 0);
}

function mapOtherCharacters(value: unknown): TibiaCharacterOtherCharacterDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => asRecord(item))
    .filter((item): item is JsonRecord => item !== null)
    .map((item) => ({
      name: readString(item['name']) ?? '',
      world: readString(item['world']),
      status: readString(item['status']),
      deleted: readBoolean(item['deleted']) === true,
      main: readBoolean(item['main']) === true,
      traded: readBoolean(item['traded']) === true,
    }))
    .filter((item) => item.name.length > 0);
}

function findCharacterInHighscores(
  rows: TibiaDataHighscoreEntry[] | undefined,
  characterName: string,
): TibiaDataHighscoreEntry | null {
  if (!Array.isArray(rows)) {
    return null;
  }

  const normalizedCharacterName = characterName.toLowerCase();
  for (const row of rows) {
    if (typeof row.name === 'string' && row.name.toLowerCase() === normalizedCharacterName) {
      return row;
    }
  }

  return null;
}

function mapCharacterVocationToHighscoresVocation(vocation: string | null): TibiaHighscoresVocation | null {
  if (!vocation) {
    return null;
  }

  const normalizedVocation = vocation.toLowerCase();
  if (normalizedVocation.includes('knight')) {
    return 'knights';
  }
  if (normalizedVocation.includes('paladin')) {
    return 'paladins';
  }
  if (normalizedVocation.includes('druid')) {
    return 'druids';
  }
  if (normalizedVocation.includes('sorcerer')) {
    return 'sorcerers';
  }

  return null;
}

// In-memory cache for highscores pages (15 minutes TTL)
const HIGHSCORES_CACHE_TTL_MS = 15 * 60 * 1000;
interface CacheEntry {
  data: TibiaDataHighscoresPayload;
  timestamp: number;
}
const highscoresPageCache = new Map<string, CacheEntry>();

function getCacheKey(world: string, page: number, vocation: TibiaHighscoresVocation): string {
  return `${world}:${vocation}:${page}`;
}

function getFromCache(cacheKey: string): TibiaDataHighscoresPayload | null {
  const entry = highscoresPageCache.get(cacheKey);
  if (!entry) {
    return null;
  }

  const now = Date.now();
  if (now - entry.timestamp > HIGHSCORES_CACHE_TTL_MS) {
    highscoresPageCache.delete(cacheKey);
    return null;
  }

  return entry.data;
}

function setInCache(cacheKey: string, data: TibiaDataHighscoresPayload): void {
  highscoresPageCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
}

async function fetchHighscoresPage(
  world: string,
  page: number,
  vocation: TibiaHighscoresVocation,
): Promise<TibiaDataHighscoresPayload> {
  const cacheKey = getCacheKey(world, page, vocation);
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch(
    `${TIBIA_DATA_API_BASE_URL}/highscores/${encodeURIComponent(world)}/experience/${vocation}/${page}`,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    if (response.status === 400) {
      const payload = (await response.json()) as TibiaDataHighscoresResponse;
      const errorCode = readNumber(payload.information?.status?.error);
      const message = readString(payload.information?.status?.message) ?? 'highscores restriction mode';
      if (errorCode === RESTRICTION_MODE_ERROR_CODE) {
        throw new TibiaDataRestrictionModeError(message);
      }
    }

    throw new Error(`TibiaData highscores request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as TibiaDataHighscoresResponse;
  const highscores = payload.highscores;
  if (!highscores) {
    throw new Error('TibiaData highscores payload is missing highscores section');
  }

  setInCache(cacheKey, highscores);
  return highscores;
}

async function findCharacterInHighscoresPages(
  characterName: string,
  world: string,
  vocation: TibiaHighscoresVocation,
): Promise<TibiaCharacterExperienceDto> {
  const allSnapshots: Array<{
    characterName: string;
    world: string;
    vocation: string;
    level: number;
    rank: number;
    exactExperience: number;
  }> = [];

  const firstPage = await fetchHighscoresPage(world, 1, vocation);
  const highscoreAgeMinutes = readNumber(firstPage.highscore_age);

  // Collect all characters from first page
  if (firstPage.highscore_list) {
    for (const entry of firstPage.highscore_list) {
      const name = readString(entry.name);
      const level = readNumber(entry.level);
      const rank = readNumber(entry.rank);
      const value = readNumber(entry.value);
      const entryVocation = readString(entry.vocation);
      if (name && level !== null && rank !== null && value !== null && entryVocation) {
        allSnapshots.push({
          characterName: name,
          world,
          vocation: entryVocation,
          level,
          rank,
          exactExperience: value,
        });
      }
    }
  }

  const firstMatch = findCharacterInHighscores(firstPage.highscore_list, characterName);
  if (firstMatch) {
    // Save snapshots in background (non-blocking)
    void saveHighscoresSnapshots(allSnapshots);
    return {
      status: 'found',
      exactExperience: readNumber(firstMatch.value),
      rank: readNumber(firstMatch.rank),
      vocation: readString(firstMatch.vocation),
      world: readString(firstMatch.world) ?? world,
      highscoreAgeMinutes,
    };
  }

  const totalPagesRaw = readNumber(firstPage.highscore_page?.total_pages);
  const totalPages = Math.min(Math.max(totalPagesRaw ?? 1, 1), MAX_HIGHSCORE_PAGES);

  for (let page = 2; page <= totalPages; page += 1) {
    const currentPage = await fetchHighscoresPage(world, page, vocation);

    // Collect all characters from current page
    if (currentPage.highscore_list) {
      for (const entry of currentPage.highscore_list) {
        const name = readString(entry.name);
        const level = readNumber(entry.level);
        const rank = readNumber(entry.rank);
        const value = readNumber(entry.value);
        const entryVocation = readString(entry.vocation);
        if (name && level !== null && rank !== null && value !== null && entryVocation) {
          allSnapshots.push({
            characterName: name,
            world,
            vocation: entryVocation,
            level,
            rank,
            exactExperience: value,
          });
        }
      }
    }

    const match = findCharacterInHighscores(currentPage.highscore_list, characterName);
    if (match) {
      // Save snapshots in background (non-blocking)
      void saveHighscoresSnapshots(allSnapshots);
      return {
        status: 'found',
        exactExperience: readNumber(match.value),
        rank: readNumber(match.rank),
        vocation: readString(match.vocation),
        world: readString(match.world) ?? world,
        highscoreAgeMinutes,
      };
    }
  }

  // Save all collected snapshots even if character not found
  void saveHighscoresSnapshots(allSnapshots);

  return {
    status: 'outside_top1000',
    exactExperience: null,
    rank: null,
    vocation: null,
    world,
    highscoreAgeMinutes,
  };
}

async function fetchCharacterExperienceFromHighscores(
  characterName: string,
  world: string,
  characterVocation: string | null,
): Promise<TibiaCharacterExperienceDto> {
  const preferredVocation = mapCharacterVocationToHighscoresVocation(characterVocation);

  if (preferredVocation === null) {
    return {
      status: 'unavailable',
      exactExperience: null,
      rank: null,
      vocation: characterVocation,
      world,
      highscoreAgeMinutes: null,
    };
  }

  try {
    return await findCharacterInHighscoresPages(characterName, world, preferredVocation);
  } catch (error) {
    if (error instanceof TibiaDataRestrictionModeError) {
      return {
        status: 'unavailable',
        exactExperience: null,
        rank: null,
        vocation: characterVocation,
        world,
        highscoreAgeMinutes: null,
      };
    }

    throw error;
  }
}

let boostableBossesCache: { data: BoostableBossesDto; timestamp: number } | null = null;
let creaturesCache: { data: TibiaCreaturesDto; timestamp: number } | null = null;

export async function fetchBoostableBosses(): Promise<BoostableBossesDto> {
  const now = Date.now();
  if (
    boostableBossesCache &&
    now - boostableBossesCache.timestamp <= HIGHSCORES_CACHE_TTL_MS
  ) {
    return boostableBossesCache.data;
  }

  const response = await fetch(`${TIBIA_DATA_API_BASE_URL}/boostablebosses`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`TibiaData request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as TibiaDataBoostableBossesResponse;
  const data = {
    boosted: mapBoss(payload.boostable_bosses?.boosted),
    boostableBossList: (payload.boostable_bosses?.boostable_boss_list ?? [])
      .map((boss) => mapBoss(boss))
      .filter((boss): boss is BoostableBossDto => boss !== null),
  };
  boostableBossesCache = { data, timestamp: now };
  return data;
}

export async function fetchCreatures(): Promise<TibiaCreaturesDto> {
  const now = Date.now();
  if (creaturesCache && now - creaturesCache.timestamp <= HIGHSCORES_CACHE_TTL_MS) {
    return creaturesCache.data;
  }

  const response = await fetch(`${TIBIA_DATA_API_BASE_URL}/creatures`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`TibiaData request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as TibiaDataCreaturesResponse;
  const data = {
    boosted: mapCreature(payload.creatures?.boosted),
    creatureList: (payload.creatures?.creature_list ?? [])
      .map((creature) => mapCreature(creature))
      .filter((creature): creature is TibiaCreatureDto => creature !== null),
  };
  creaturesCache = { data, timestamp: now };
  return data;
}

export async function fetchCharacter(name: string): Promise<TibiaCharacterDto> {
  const normalizedName = name.trim();
  const response = await fetch(`${TIBIA_DATA_API_BASE_URL}/character/${encodeURIComponent(normalizedName)}`, {
    cache: 'no-store',
  });

  if (response.status === 404) {
    throw new TibiaDataNotFoundError(`Character "${normalizedName}" not found`);
  }

  if (!response.ok) {
    throw new Error(`TibiaData request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as TibiaDataCharacterResponse;
  const payloadStatusCode = payload.information?.status?.http_code;
  if (payloadStatusCode === 404) {
    throw new TibiaDataNotFoundError(`Character "${normalizedName}" not found`);
  }

  const characterRoot = asRecord(payload.character);
  const characterInfo = asRecord(characterRoot?.['character']);
  if (!characterInfo) {
    throw new TibiaDataNotFoundError(`Character "${normalizedName}" not found`);
  }

  const characterName = readString(characterInfo['name']);
  if (!characterName) {
    throw new TibiaDataNotFoundError(`Character "${normalizedName}" not found`);
  }

  const guild = asRecord(characterInfo['guild']);
  const accountInformation = asRecord(characterRoot?.['account_information']);
  const worldName = readString(characterInfo['world']);
  const characterVocation = readString(characterInfo['vocation']);
  let experience: TibiaCharacterExperienceDto | null = null;

  if (worldName) {
    try {
      experience = await fetchCharacterExperienceFromHighscores(
        characterName,
        worldName,
        characterVocation,
      );
    } catch {
      experience = {
        status: 'unavailable',
        exactExperience: null,
        rank: null,
        vocation: null,
        world: worldName,
        highscoreAgeMinutes: null,
      };
    }
  }

  return {
    name: characterName,
    sex: readString(characterInfo['sex']),
    title: readString(characterInfo['title']),
    vocation: readString(characterInfo['vocation']),
    level: readNumber(characterInfo['level']),
    achievementPoints: readNumber(characterInfo['achievement_points']),
    world: readString(characterInfo['world']),
    residence: readString(characterInfo['residence']),
    marriedTo: readString(characterInfo['married_to']),
    lastLogin: readString(characterInfo['last_login']),
    accountStatus: readString(characterInfo['account_status']),
    unlockedTitles: readNumber(characterInfo['unlocked_titles']),
    comment: readString(characterInfo['comment']),
    guild:
      guild && typeof guild['name'] === 'string' && typeof guild['rank'] === 'string'
        ? { name: guild['name'], rank: guild['rank'] }
        : null,
    formerNames: readStringArray(characterInfo['former_names']),
    formerWorlds: readStringArray(characterInfo['former_worlds']),
    accountCreated: readString(accountInformation?.['created']),
    loyaltyTitle: readString(accountInformation?.['loyalty_title']),
    achievements: mapAchievements(characterRoot?.['achievements']),
    otherCharacters: mapOtherCharacters(characterRoot?.['other_characters']),
    experience,
  };
}
