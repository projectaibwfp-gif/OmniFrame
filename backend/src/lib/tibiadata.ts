import type {
  BoostableBossDto,
  BoostableBossesDto,
  TibiaCharacterAchievementDto,
  TibiaCharacterDto,
  TibiaCharacterOtherCharacterDto,
} from '@shared/api-contract';

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

type JsonRecord = Record<string, unknown>;

export class TibiaDataNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TibiaDataNotFoundError';
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

export async function fetchBoostableBosses(): Promise<BoostableBossesDto> {
  const response = await fetch(`${TIBIA_DATA_API_BASE_URL}/boostablebosses`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`TibiaData request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as TibiaDataBoostableBossesResponse;
  return {
    boosted: mapBoss(payload.boostable_bosses?.boosted),
    boostableBossList: (payload.boostable_bosses?.boostable_boss_list ?? [])
      .map((boss) => mapBoss(boss))
      .filter((boss): boss is BoostableBossDto => boss !== null),
  };
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
  };
}
