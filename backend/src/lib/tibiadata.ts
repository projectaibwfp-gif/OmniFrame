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
import { toIsoUtc } from './date-time';
import { getLatestHighscoresSnapshot, saveHighscoresSnapshots } from './highscores-snapshots';
import type { HighscoresSnapshot } from './highscores-snapshots';
import type { TibiaHighscoresVocation } from './highscores-vocations';
import { HttpStatus } from './http-status';
import {
  asRecord,
  readFlag,
  readNumber,
  readRecords,
  readString,
  readStringArray,
  type JsonRecord,
} from './json-readers';
import { fetchTibiaJson, requestTibiaData, TibiaDataNotFoundError } from './tibiadata-client';
import { createTtlCache } from './ttl-cache';

export { TibiaDataNotFoundError } from './tibiadata-client';

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
  race?: unknown;
  last_day_players_killed?: unknown;
  last_day_killed?: unknown;
  last_week_players_killed?: unknown;
  last_week_killed?: unknown;
}

interface TibiaDataKillStatisticsResponse {
  killstatistics?: {
    world?: unknown;
    updated_at?: unknown;
    entries?: TibiaDataKillStatisticsEntry[];
  };
}

const MAX_HIGHSCORE_PAGES = 50;
const FIRST_HIGHSCORE_PAGE = 1;
const RESTRICTION_MODE_ERROR_CODE = 9002;
const MS_PER_MINUTE = 60_000;
const TIBIA_DATA_CACHE_TTL_MINUTES = 15;
const TIBIA_DATA_CACHE_TTL_MS = TIBIA_DATA_CACHE_TTL_MINUTES * MS_PER_MINUTE;
const SINGLE_ENTRY_CACHE_KEY = 'latest';
const DEFAULT_RESTRICTION_MODE_MESSAGE = 'highscores restriction mode';

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

function mapAchievements(value: unknown): TibiaCharacterAchievementDto[] {
  return readRecords(value)
    .map((item) => ({
      name: readString(item['name']) ?? '',
      grade: readNumber(item['grade']),
      secret: readFlag(item['secret']),
    }))
    .filter((item) => item.name.length > 0);
}

function mapOtherCharacters(value: unknown): TibiaCharacterOtherCharacterDto[] {
  return readRecords(value)
    .map((item) => ({
      name: readString(item['name']) ?? '',
      world: readString(item['world']),
      status: readString(item['status']),
      deleted: readFlag(item['deleted']),
      main: readFlag(item['main']),
      traded: readFlag(item['traded']),
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

function toHighscoresSnapshots(
  page: TibiaDataHighscoresPayload,
  world: string,
): HighscoresSnapshot[] {
  return (page.highscore_list ?? [])
    .map((entry) => toHighscoresSnapshot(entry, world))
    .filter((snapshot): snapshot is HighscoresSnapshot => snapshot !== null);
}

function readTotalHighscorePages(firstPage: TibiaDataHighscoresPayload): number {
  const totalPagesRaw = readNumber(firstPage.highscore_page?.total_pages);
  return Math.min(
    Math.max(totalPagesRaw ?? FIRST_HIGHSCORE_PAGE, FIRST_HIGHSCORE_PAGE),
    MAX_HIGHSCORE_PAGES,
  );
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
  if (normalizedVocation.includes('monk')) {
    return 'monks';
  }

  return null;
}

const highscoresPageCache = createTtlCache<TibiaDataHighscoresPayload>(TIBIA_DATA_CACHE_TTL_MS);

function getHighscoresCacheKey(
  world: string,
  page: number,
  vocation: TibiaHighscoresVocation,
): string {
  return `${world}:${vocation}:${page}`;
}

async function throwIfRestrictionMode(response: Response): Promise<void> {
  if (response.status !== HttpStatus.BAD_REQUEST) {
    return;
  }

  const payload = (await response.json()) as TibiaDataHighscoresResponse;
  const errorCode = readNumber(payload.information?.status?.error);
  if (errorCode === RESTRICTION_MODE_ERROR_CODE) {
    const message =
      readString(payload.information?.status?.message) ?? DEFAULT_RESTRICTION_MODE_MESSAGE;
    throw new TibiaDataRestrictionModeError(message);
  }
}

async function loadHighscoresPage(
  world: string,
  page: number,
  vocation: TibiaHighscoresVocation,
): Promise<TibiaDataHighscoresPayload> {
  const response = await requestTibiaData(
    `/highscores/${encodeURIComponent(world)}/experience/${vocation}/${page}`,
  );

  if (!response.ok) {
    await throwIfRestrictionMode(response);
    throw new Error(`TibiaData highscores request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as TibiaDataHighscoresResponse;
  if (!payload.highscores) {
    throw new Error('TibiaData highscores payload is missing highscores section');
  }

  return payload.highscores;
}

function fetchHighscoresPage(
  world: string,
  page: number,
  vocation: TibiaHighscoresVocation,
): Promise<TibiaDataHighscoresPayload> {
  return highscoresPageCache.getOrLoad(getHighscoresCacheKey(world, page, vocation), () =>
    loadHighscoresPage(world, page, vocation),
  );
}

async function findCharacterInHighscoresPages(
  characterName: string,
  world: string,
  vocation: TibiaHighscoresVocation,
): Promise<TibiaCharacterExperienceDto & { lookupLog: string }> {
  const logs: string[] = [];
  logs.push(`Searching: ${characterName} on ${world} (${vocation})`);

  const firstPage = await fetchHighscoresPage(world, FIRST_HIGHSCORE_PAGE, vocation);
  const highscoreAgeMinutes = readNumber(firstPage.highscore_age);
  logs.push(`Page 1: ${firstPage.highscore_list?.length ?? 0} entries`);

  const allSnapshots = toHighscoresSnapshots(firstPage, world);
  let foundMatch = findCharacterInHighscores(firstPage.highscore_list, characterName);
  let foundPage = foundMatch ? FIRST_HIGHSCORE_PAGE : null;

  const totalPages = readTotalHighscorePages(firstPage);
  logs.push(`Total pages to scan: ${totalPages}`);

  for (let page = FIRST_HIGHSCORE_PAGE + 1; page <= totalPages; page += 1) {
    const currentPage = await fetchHighscoresPage(world, page, vocation);
    logs.push(`Page ${page}: ${currentPage.highscore_list?.length ?? 0} entries`);
    allSnapshots.push(...toHighscoresSnapshots(currentPage, world));

    if (foundMatch === null) {
      foundMatch = findCharacterInHighscores(currentPage.highscore_list, characterName);
      foundPage = foundMatch ? page : null;
    }
  }

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

const boostableBossesCache = createTtlCache<BoostableBossesDto>(TIBIA_DATA_CACHE_TTL_MS);
const creaturesCache = createTtlCache<TibiaCreaturesDto>(TIBIA_DATA_CACHE_TTL_MS);
const newsCache = createTtlCache<TibiaNewsListDto>(TIBIA_DATA_CACHE_TTL_MS);

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

async function loadNews(): Promise<TibiaNewsListDto> {
  const payload = await fetchTibiaJson<TibiaDataNewsResponse>('/news/latest');
  const news = (payload.news ?? [])
    .map((item) => mapNewsItem(item))
    .filter((item): item is TibiaNewsDto => item !== null);

  return {
    news,
    cachedAt: toIsoUtc(new Date()),
  };
}

async function loadBoostableBosses(): Promise<BoostableBossesDto> {
  const payload = await fetchTibiaJson<TibiaDataBoostableBossesResponse>('/boostablebosses');
  return {
    boosted: mapBoss(payload.boostable_bosses?.boosted),
    boostableBossList: (payload.boostable_bosses?.boostable_boss_list ?? [])
      .map((boss) => mapBoss(boss))
      .filter((boss): boss is BoostableBossDto => boss !== null),
  };
}

async function loadCreatures(): Promise<TibiaCreaturesDto> {
  const payload = await fetchTibiaJson<TibiaDataCreaturesResponse>('/creatures');
  return {
    boosted: mapCreature(payload.creatures?.boosted),
    creatureList: (payload.creatures?.creature_list ?? [])
      .map((creature) => mapCreature(creature))
      .filter((creature): creature is TibiaCreatureDto => creature !== null),
  };
}

export function fetchNews(): Promise<TibiaNewsListDto> {
  return newsCache.getOrLoad(SINGLE_ENTRY_CACHE_KEY, loadNews);
}

export function fetchBoostableBosses(): Promise<BoostableBossesDto> {
  return boostableBossesCache.getOrLoad(SINGLE_ENTRY_CACHE_KEY, loadBoostableBosses);
}

export function fetchCreatures(): Promise<TibiaCreaturesDto> {
  return creaturesCache.getOrLoad(SINGLE_ENTRY_CACHE_KEY, loadCreatures);
}

export async function fetchKillStatistics(world: string): Promise<TibiaKillStatisticsWorldDto> {
  const payload = await fetchTibiaJson<TibiaDataKillStatisticsResponse>(
    `/killstatistics/${encodeURIComponent(world)}`,
    'Kill statistics not found',
  );

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

async function fetchCharacterExperience(
  characterName: string,
  worldName: string,
  characterVocation: string | null,
): Promise<TibiaCharacterExperienceDto> {
  try {
    return await fetchCharacterExperienceFromHighscores(
      characterName,
      worldName,
      characterVocation,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'unknown highscores error';
    return {
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

export async function fetchCharacter(name: string): Promise<TibiaCharacterDto> {
  const normalizedName = name.trim();
  const notFoundMessage = `Character "${normalizedName}" not found`;
  const payload = await fetchTibiaJson<TibiaDataCharacterResponse>(
    `/character/${encodeURIComponent(normalizedName)}`,
    notFoundMessage,
  );

  if (payload.information?.status?.http_code === HttpStatus.NOT_FOUND) {
    throw new TibiaDataNotFoundError(notFoundMessage);
  }

  const characterRoot = asRecord(payload.character);
  const characterInfo = asRecord(characterRoot?.['character']);
  const characterName = characterInfo ? readString(characterInfo['name']) : null;
  if (!characterInfo || !characterName) {
    throw new TibiaDataNotFoundError(notFoundMessage);
  }

  const worldName = readString(characterInfo['world']);
  const experience = worldName
    ? await fetchCharacterExperience(
        characterName,
        worldName,
        readString(characterInfo['vocation']),
      )
    : null;

  return mapCharacterDto({
    characterName,
    characterInfo,
    characterRoot,
    guild: asRecord(characterInfo['guild']),
    accountInformation: asRecord(characterRoot?.['account_information']),
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
 * Scans every highscores page of one world/vocation and stores the entries as
 * snapshots. Used by the cron job; returns the number of characters collected.
 */
export async function fetchHighscoresForWorldAndVocation(
  world: string,
  vocation: TibiaHighscoresVocation,
): Promise<number> {
  const firstPage = await fetchHighscoresPage(world, FIRST_HIGHSCORE_PAGE, vocation);
  const allSnapshots = toHighscoresSnapshots(firstPage, world);
  const totalPages = readTotalHighscorePages(firstPage);

  for (let page = FIRST_HIGHSCORE_PAGE + 1; page <= totalPages; page += 1) {
    const currentPage = await fetchHighscoresPage(world, page, vocation);
    allSnapshots.push(...toHighscoresSnapshots(currentPage, world));
  }

  await saveHighscoresSnapshots(allSnapshots);
  return allSnapshots.length;
}
