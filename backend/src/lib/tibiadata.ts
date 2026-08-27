import type {
  BoostableBossDto,
  BoostableBossesDto,
  TibiaCharacterAchievementDto,
  TibiaCharacterDto,
  TibiaCharacterExperienceDto,
  TibiaCreatureDto,
  TibiaCreaturesDto,
  TibiaCharacterOtherCharacterDto,
  TibiaNewsDto,
  TibiaNewsListDto,
  TibiaKillStatisticsWorldDto,
} from '@shared/api-contract';
import { getLatestHighscoresSnapshot, saveHighscoresSnapshots } from './highscores-snapshots';
import type { HighscoresSnapshot } from './highscores-snapshots';

const DEFAULT_TIBIA_DATA_API_BASE_URL = 'https://dev.tibiadata.com/v4';

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

interface TibiaDataKillStatisticsEntry {
  world?: unknown;
  name?: unknown;
  description?: unknown;
  value?: unknown;
}

interface TibiaDataKillStatisticsResponse {
  killstatistics?: {
    world?: unknown;
    updated_at?: unknown;
    entries?: TibiaDataKillStatisticsEntry[];
  };
}

type JsonRecord = Record<string, unknown>;
const MAX_HIGHSCORE_PAGES = 20;
const RESTRICTION_MODE_ERROR_CODE = 9002;
const MS_PER_MINUTE = 60_000;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_OK = 200;

export type TibiaHighscoresVocation = 'all' | 'knights' | 'paladins' | 'druids' | 'sorcerers';

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

function mapKillStatisticsEntry(
  entry: TibiaDataKillStatisticsEntry,
): TibiaKillStatisticsWorldDto['entries'][number] | null {
  const race = readString(entry.race);
  const lastDayPlayersKilled = readNumber(entry.last_day_players_killed);
  const lastDayKilled = readNumber(entry.last_day_killed);
  const lastWeekPlayersKilled = readNumber(entry.last_week_players_killed);
  const lastWeekKilled = readNumber(entry.last_week_killed);

  if (
    !race ||
    lastDayPlayersKilled === null ||
    lastDayKilled === null ||
    lastWeekPlayersKilled === null ||
    lastWeekKilled === null
  ) {
    return null;
  }

  return {
    race,
    lastDayPlayersKilled,
    lastDayKilled,
    lastWeekPlayersKilled,
    lastWeekKilled,
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

function toHighscoresSnapshot(
  entry: TibiaDataHighscoreEntry,
  world: string,
): HighscoresSnapshot | null {
  const name = readString(entry.name);
  const level = readNumber(entry.level);
  const rank = readNumber(entry.rank);
  const value = readNumber(entry.value);
  const entryVocation = readString(entry.vocation);
  if (!name || level === null || rank === null || value === null || !entryVocation) {
    return null;
  }

  return {
    characterName: name,
    world,
    vocation: entryVocation,
    level,
    rank,
    exactExperience: value,
  };
}

function mapCharacterVocationToHighscoresVocation(
  vocation: string | null,
): TibiaHighscoresVocation | null {
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
const TIBIA_DATA_CACHE_TTL_MS = 15 * 60 * 1000;
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
  if (now - entry.timestamp > TIBIA_DATA_CACHE_TTL_MS) {
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
    if (response.status === HTTP_BAD_REQUEST) {
      const payload = (await response.json()) as TibiaDataHighscoresResponse;
      const errorCode = readNumber(payload.information?.status?.error);
      const message =
        readString(payload.information?.status?.message) ?? 'highscores restriction mode';
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
): Promise<TibiaCharacterExperienceDto & { lookupLog: string }> {
  const allSnapshots: HighscoresSnapshot[] = [];

  const logs: string[] = [];
  logs.push(`Searching: ${characterName} on ${world} (${vocation})`);

  const firstPage = await fetchHighscoresPage(world, 1, vocation);
  const highscoreAgeMinutes = readNumber(firstPage.highscore_age);

  logs.push(`Page 1: ${firstPage.highscore_list?.length ?? 0} entries`);

  // Collect all characters from first page
  if (firstPage.highscore_list) {
    for (const entry of firstPage.highscore_list) {
      const snapshot = toHighscoresSnapshot(entry, world);
      if (snapshot) {
        allSnapshots.push(snapshot);
      }
    }
  }

  const firstMatch = findCharacterInHighscores(firstPage.highscore_list, characterName);
  let foundMatch = firstMatch ?? null;
  let foundPage = firstMatch ? 1 : null;

  const totalPagesRaw = readNumber(firstPage.highscore_page?.total_pages);
  const totalPages = Math.min(Math.max(totalPagesRaw ?? 1, 1), MAX_HIGHSCORE_PAGES);
  logs.push(`Total pages to scan: ${totalPages}`);

  for (let page = 2; page <= totalPages; page += 1) {
    const currentPage = await fetchHighscoresPage(world, page, vocation);
    logs.push(`Page ${page}: ${currentPage.highscore_list?.length ?? 0} entries`);

    // Collect all characters from current page
    if (currentPage.highscore_list) {
      for (const entry of currentPage.highscore_list) {
        const snapshot = toHighscoresSnapshot(entry, world);
        if (snapshot) {
          allSnapshots.push(snapshot);
        }
      }
    }

    if (foundMatch === null) {
      const match = findCharacterInHighscores(currentPage.highscore_list, characterName);
      if (match) {
        foundMatch = match;
        foundPage = page;
      }
    }
  }

  // Save all collected snapshots after scanning all pages
  await saveHighscoresSnapshots(allSnapshots);

  if (foundMatch) {
    logs.push(`✅ FOUND on page ${foundPage}: rank=${foundMatch.rank}`);
    logs.push(`Saved snapshots: ${allSnapshots.length} entries`);
    return {
      status: 'found',
      exactExperience: readNumber(foundMatch.value),
      rank: readNumber(foundMatch.rank),
      vocation: readString(foundMatch.vocation),
      world: readString(foundMatch.world) ?? world,
      highscoreAgeMinutes,
      lookupLog: logs.join('\n'),
    };
  }

  logs.push(`❌ NOT FOUND in top ${totalPages} pages`);
  logs.push(`Saved snapshots: ${allSnapshots.length} entries`);
  return {
    status: 'outside_top1000',
    exactExperience: null,
    rank: null,
    vocation: null,
    world,
    highscoreAgeMinutes,
    lookupLog: logs.join('\n'),
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
      lookupLog: `Vocation "${characterVocation}" not recognized - cannot search highscores`,
    };
  }

  try {
    return await findCharacterInHighscoresPages(characterName, world, preferredVocation);
  } catch (error) {
    if (error instanceof TibiaDataRestrictionModeError) {
      const latestSnapshot = await getLatestHighscoresSnapshot(characterName, world);
      if (latestSnapshot) {
        const checkedAtMs = Date.parse(latestSnapshot.checkedAt);
        const highscoreAgeMinutes = Number.isNaN(checkedAtMs)
          ? null
          : Math.max(0, Math.floor((Date.now() - checkedAtMs) / MS_PER_MINUTE));

        return {
          status: 'found',
          exactExperience: latestSnapshot.exactExperience,
          rank: latestSnapshot.rank,
          vocation: latestSnapshot.vocation,
          world,
          highscoreAgeMinutes,
          lookupLog: `TibiaData restriction mode active - live query blocked for ${preferredVocation}. Using latest DB snapshot from ${latestSnapshot.checkedAt}.`,
        };
      }

      return {
        status: 'unavailable',
        exactExperience: null,
        rank: null,
        vocation: characterVocation,
        world,
        highscoreAgeMinutes: null,
        lookupLog: `TibiaData restriction mode active - cannot query ${preferredVocation} highscores and no DB snapshot found`,
      };
    }

    throw error;
  }
}

interface TibiaDataNewsItem {
  id?: unknown;
  date?: unknown;
  category?: unknown;
  type?: unknown;
  news?: unknown;
  url?: unknown;
  url_api?: unknown;
}

interface TibiaDataNewsResponse {
  news?: TibiaDataNewsItem[];
}

let boostableBossesCache: { data: BoostableBossesDto; timestamp: number } | null = null;
let creaturesCache: { data: TibiaCreaturesDto; timestamp: number } | null = null;
let newsCache: { data: TibiaNewsListDto; timestamp: number } | null = null;

function mapNewsItem(item: TibiaDataNewsItem): TibiaNewsDto | null {
  const id = readNumber(item.id);
  const date = readString(item.date);
  const category = readString(item.category);
  const type = readString(item.type);
  const title = readString(item.news);
  const url = readString(item.url);
  const urlApi = readString(item.url_api);

  if (!id || !date || !category || !type || !title || !url) {
    return null;
  }

  return {
    id,
    date,
    category,
    type,
    title,
    url,
    urlApi: urlApi ?? '',
  };
}

export async function fetchNews(): Promise<TibiaNewsListDto> {
  const now = Date.now();
  if (newsCache && now - newsCache.timestamp <= TIBIA_DATA_CACHE_TTL_MS) {
    return newsCache.data;
  }

  const response = await fetch(`${TIBIA_DATA_API_BASE_URL}/news/latest`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`TibiaData news request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as TibiaDataNewsResponse;
  const news = (payload.news ?? [])
    .map((item) => mapNewsItem(item))
    .filter((item): item is TibiaNewsDto => item !== null);

  const data: TibiaNewsListDto = {
    news,
    cachedAt: new Date().toISOString(),
  };
  newsCache = { data, timestamp: now };
  return data;
}

export async function fetchBoostableBosses(): Promise<BoostableBossesDto> {
  const now = Date.now();
  if (boostableBossesCache && now - boostableBossesCache.timestamp <= TIBIA_DATA_CACHE_TTL_MS) {
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
  if (creaturesCache && now - creaturesCache.timestamp <= TIBIA_DATA_CACHE_TTL_MS) {
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

export async function fetchKillStatistics(world: string): Promise<TibiaKillStatisticsWorldDto> {
  const response = await fetchFromTibiaData(`/killstatistics/${encodeURIComponent(world)}`);
  const payload = (await response.json()) as TibiaDataKillStatisticsResponse;

  if (response.status === HTTP_NOT_FOUND) {
    throw new TibiaDataNotFoundError('Kill statistics not found');
  }

  const container = payload.killstatistics;
  if (!container) {
    throw new Error('Invalid kill statistics response');
  }

  return {
    world: readString(container.world) ?? world,
    updatedAt: readString(container.updated_at),
    entries: (container.entries ?? [])
      .map((entry) => mapKillStatisticsEntry(entry))
      .filter((entry): entry is TibiaKillStatisticsWorldDto['entries'][number] => entry !== null),
  };
}

export async function fetchCharacter(name: string): Promise<TibiaCharacterDto> {
  const normalizedName = name.trim();
  const response = await fetch(
    `${TIBIA_DATA_API_BASE_URL}/character/${encodeURIComponent(normalizedName)}`,
    {
      cache: 'no-store',
    },
  );

  if (response.status === HTTP_NOT_FOUND) {
    throw new TibiaDataNotFoundError(`Character "${normalizedName}" not found`);
  }

  if (!response.ok) {
    throw new Error(`TibiaData request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as TibiaDataCharacterResponse;
  const payloadStatusCode = payload.information?.status?.http_code;
  if (payloadStatusCode === HTTP_NOT_FOUND) {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'unknown highscores error';
      experience = {
        status: 'unavailable',
        exactExperience: null,
        rank: null,
        vocation: null,
        world: worldName,
        highscoreAgeMinutes: null,
        lookupLog: `Highscores lookup failed: ${errorMessage}`,
      };
    }
  }

  return mapCharacterDto({
    characterName,
    characterInfo,
    characterRoot,
    guild,
    accountInformation,
    experience,
  });
}

function mapCharacterDto(input: {
  characterName: string;
  characterInfo: JsonRecord;
  characterRoot: JsonRecord | null;
  guild: JsonRecord | null;
  accountInformation: JsonRecord | null;
  experience: TibiaCharacterExperienceDto | null;
}): TibiaCharacterDto {
  const { characterName, characterInfo, characterRoot, guild, accountInformation, experience } =
    input;

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

/**
 * Fetch highscores for a specific world and vocation
 * Used by cron to populate database with all characters
 * Returns count of characters collected
 */
export async function fetchHighscoresForWorldAndVocation(
  world: string,
  vocation: TibiaHighscoresVocation,
): Promise<number> {
  const allSnapshots: HighscoresSnapshot[] = [];

  const firstPage = await fetchHighscoresPage(world, 1, vocation);
  const totalPagesRaw = readNumber(firstPage.highscore_page?.total_pages);
  const totalPages = Math.min(Math.max(totalPagesRaw ?? 1, 1), MAX_HIGHSCORE_PAGES);

  // Collect from first page
  if (firstPage.highscore_list) {
    for (const entry of firstPage.highscore_list) {
      const snapshot = toHighscoresSnapshot(entry, world);
      if (snapshot) {
        allSnapshots.push(snapshot);
      }
    }
  }

  // Collect from remaining pages
  for (let page = 2; page <= totalPages; page += 1) {
    const currentPage = await fetchHighscoresPage(world, page, vocation);
    if (currentPage.highscore_list) {
      for (const entry of currentPage.highscore_list) {
        const snapshot = toHighscoresSnapshot(entry, world);
        if (snapshot) {
          allSnapshots.push(snapshot);
        }
      }
    }
  }

  // Save all collected snapshots
  await saveHighscoresSnapshots(allSnapshots);
  return allSnapshots.length;
}
