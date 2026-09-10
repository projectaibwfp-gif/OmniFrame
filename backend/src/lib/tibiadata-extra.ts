import type {
  TibiaFansiteContentTypeDto,
  TibiaFansiteDto,
  TibiaFansiteSocialMediaDto,
  TibiaFansitesDto,
  TibiaGuildDto,
  TibiaGuildMemberDto,
  TibiaGuildOverviewDto,
  TibiaGuildsOverviewDto,
  TibiaGuildhallDto,
  TibiaHouseAuctionDto,
  TibiaHouseDto,
  TibiaHouseOverviewAuctionDto,
  TibiaHouseOverviewDto,
  TibiaHouseRentalDto,
  TibiaHouseStatusDto,
  TibiaHousesOverviewDto,
  TibiaInvitedGuildMemberDto,
  TibiaOnlinePlayerDto,
  TibiaRuneInformationDto,
  TibiaSpellDetailsDto,
  TibiaSpellDto,
  TibiaSpellInformationDto,
  TibiaSpellsOverviewDto,
  TibiaWorldDto,
  TibiaWorldOverviewDto,
  TibiaWorldsOverviewDto,
} from '@shared/api-contract';
import { TIBIA_DATA_API_BASE_URL, TibiaDataNotFoundError } from './tibiadata';

type JsonRecord = Record<string, unknown>;
const HTTP_NOT_FOUND = 404;

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

function readBoolean(value: unknown): boolean {
  return value === true;
}

function readRecords(value: unknown): JsonRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => asRecord(item)).filter((item): item is JsonRecord => item !== null);
}

function readStrings(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function readRecordValue(record: JsonRecord, key: string): JsonRecord | null {
  return asRecord(record[key]);
}

function readRequiredString(record: JsonRecord, key: string): string {
  return readString(record[key]) ?? '';
}

async function fetchResource(path: string): Promise<JsonRecord> {
  const response = await fetch(`${TIBIA_DATA_API_BASE_URL}${path}`, { cache: 'no-store' });

  if (response.status === HTTP_NOT_FOUND) {
    throw new TibiaDataNotFoundError('TibiaData resource not found');
  }

  if (!response.ok) {
    throw new Error(`TibiaData request failed with status ${response.status}`);
  }

  const payload = asRecord(await response.json());
  if (!payload) {
    throw new Error('Invalid TibiaData response');
  }

  return payload;
}

function mapContentType(value: unknown): TibiaFansiteContentTypeDto | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  return {
    statistics: readBoolean(record['statistics']),
    texts: readBoolean(record['texts']),
    tools: readBoolean(record['tools']),
    wiki: readBoolean(record['wiki']),
  };
}

function mapSocialMedia(value: unknown): TibiaFansiteSocialMediaDto | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  return {
    discord: readBoolean(record['discord']),
    facebook: readBoolean(record['facebook']),
    instagram: readBoolean(record['instagram']),
    reddit: readBoolean(record['reddit']),
    twitch: readBoolean(record['twitch']),
    twitter: readBoolean(record['twitter']),
    youtube: readBoolean(record['youtube']),
  };
}

function mapFansite(record: JsonRecord): TibiaFansiteDto {
  return {
    contact: readString(record['contact']),
    contentType: mapContentType(record['content_type']),
    fansiteItem: readBoolean(record['fansite_item']),
    fansiteItemUrl: readString(record['fansite_item_url']),
    homepage: readString(record['homepage']),
    languages: readStrings(record['languages']),
    logoUrl: readString(record['logo_url']),
    name: readRequiredString(record, 'name'),
    socialMedia: mapSocialMedia(record['social_media']),
    specials: readStrings(record['specials']),
  };
}

export async function fetchFansites(): Promise<TibiaFansitesDto> {
  const payload = await fetchResource('/fansites');
  const fansites = readRecordValue(payload, 'fansites');

  return {
    promoted: readRecords(fansites?.['promoted']).map(mapFansite),
    supported: readRecords(fansites?.['supported']).map(mapFansite),
  };
}

function mapGuildhall(record: JsonRecord): TibiaGuildhallDto {
  return {
    name: readString(record['name']),
    paidUntil: readString(record['paid_until']),
    world: readString(record['world']),
  };
}

function mapInvitedMember(record: JsonRecord): TibiaInvitedGuildMemberDto {
  return {
    date: readString(record['date']),
    name: readRequiredString(record, 'name'),
  };
}

function mapGuildMember(record: JsonRecord): TibiaGuildMemberDto {
  return {
    joined: readString(record['joined']),
    level: readNumber(record['level']),
    name: readRequiredString(record, 'name'),
    rank: readString(record['rank']),
    status: readString(record['status']),
    title: readString(record['title']),
    vocation: readString(record['vocation']),
  };
}

function mapGuild(record: JsonRecord): TibiaGuildDto {
  return {
    active: readBoolean(record['active']),
    description: readString(record['description']),
    disbandCondition: readString(record['disband_condition']),
    disbandDate: readString(record['disband_date']),
    founded: readString(record['founded']),
    guildhalls: readRecords(record['guildhalls']).map(mapGuildhall),
    homepage: readString(record['homepage']),
    inWar: readBoolean(record['in_war']),
    invites: readRecords(record['invites']).map(mapInvitedMember),
    logoUrl: readString(record['logo_url']),
    members: readRecords(record['members']).map(mapGuildMember),
    membersInvited: readNumber(record['members_invited']),
    membersTotal: readNumber(record['members_total']),
    name: readRequiredString(record, 'name'),
    openApplications: readBoolean(record['open_applications']),
    playersOffline: readNumber(record['players_offline']),
    playersOnline: readNumber(record['players_online']),
    world: readString(record['world']),
  };
}

function mapGuildOverview(record: JsonRecord): TibiaGuildOverviewDto {
  return {
    description: readString(record['description']),
    logoUrl: readString(record['logo_url']),
    name: readRequiredString(record, 'name'),
  };
}

export async function fetchGuild(name: string): Promise<TibiaGuildDto> {
  const payload = await fetchResource(`/guild/${encodeURIComponent(name)}`);
  const guild = readRecordValue(payload, 'guild');
  if (!guild) {
    throw new TibiaDataNotFoundError('Guild not found');
  }

  return mapGuild(guild);
}

export async function fetchGuilds(world: string): Promise<TibiaGuildsOverviewDto> {
  const payload = await fetchResource(`/guilds/${encodeURIComponent(world)}`);
  const guilds = readRecordValue(payload, 'guilds');
  if (!guilds) {
    throw new TibiaDataNotFoundError('Guilds not found');
  }

  return {
    active: readRecords(guilds['active']).map(mapGuildOverview),
    formation: readRecords(guilds['formation']).map(mapGuildOverview),
    world: readString(guilds['world']),
  };
}

function mapHouseAuction(record: JsonRecord): TibiaHouseAuctionDto {
  return {
    auctionEnd: readString(record['auction_end']),
    auctionOngoing: readBoolean(record['auction_ongoing']),
    currentBid: readNumber(record['current_bid']),
    currentBidder: readString(record['current_bidder']),
  };
}

function mapHouseRental(record: JsonRecord): TibiaHouseRentalDto {
  return {
    movingDate: readString(record['moving_date']),
    owner: readString(record['owner']),
    ownerSex: readString(record['owner_sex']),
    paidUntil: readString(record['paid_until']),
    transferAccept: readBoolean(record['transfer_accept']),
    transferPrice: readNumber(record['transfer_price']),
    transferReceiver: readString(record['transfer_receiver']),
  };
}

function mapHouseStatus(value: unknown): TibiaHouseStatusDto | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const auction = readRecordValue(record, 'auction');
  const rental = readRecordValue(record, 'rental');

  return {
    auction: auction ? mapHouseAuction(auction) : null,
    isAuctioned: readBoolean(record['is_auctioned']),
    isMoving: readBoolean(record['is_moving']),
    isRented: readBoolean(record['is_rented']),
    isTransfering: readBoolean(record['is_transfering']),
    original: readString(record['original']),
    rental: rental ? mapHouseRental(rental) : null,
  };
}

function mapHouse(record: JsonRecord): TibiaHouseDto {
  return {
    beds: readNumber(record['beds']),
    houseId: readNumber(record['houseid']),
    img: readString(record['img']),
    name: readRequiredString(record, 'name'),
    rent: readNumber(record['rent']),
    size: readNumber(record['size']),
    status: mapHouseStatus(record['status']),
    town: readString(record['town']),
    type: readString(record['type']),
    world: readString(record['world']),
  };
}

function mapHouseOverviewAuction(value: unknown): TibiaHouseOverviewAuctionDto | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  return {
    currentBid: readNumber(record['current_bid']),
    finished: readBoolean(record['finished']),
    timeLeft: readString(record['time_left']),
  };
}

function mapHouseOverview(record: JsonRecord): TibiaHouseOverviewDto {
  return {
    auction: mapHouseOverviewAuction(record['auction']),
    auctioned: readBoolean(record['auctioned']),
    houseId: readNumber(record['house_id']),
    name: readRequiredString(record, 'name'),
    rent: readNumber(record['rent']),
    rented: readBoolean(record['rented']),
    size: readNumber(record['size']),
  };
}

export async function fetchHouse(world: string, houseId: number): Promise<TibiaHouseDto> {
  const payload = await fetchResource(`/house/${encodeURIComponent(world)}/${houseId}`);
  const house = readRecordValue(payload, 'house');
  if (!house) {
    throw new TibiaDataNotFoundError('House not found');
  }

  return mapHouse(house);
}

export async function fetchHouses(world: string, town: string): Promise<TibiaHousesOverviewDto> {
  const payload = await fetchResource(
    `/houses/${encodeURIComponent(world)}/${encodeURIComponent(town)}`,
  );
  const houses = readRecordValue(payload, 'houses');
  if (!houses) {
    throw new TibiaDataNotFoundError('Houses not found');
  }

  return {
    guildhallList: readRecords(houses['guildhall_list']).map(mapHouseOverview),
    houseList: readRecords(houses['house_list']).map(mapHouseOverview),
    town: readString(houses['town']),
    world: readString(houses['world']),
  };
}

function mapRuneInformation(value: unknown): TibiaRuneInformationDto | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  return {
    damageType: readString(record['damage_type']),
    groupAttack: readBoolean(record['group_attack']),
    groupHealing: readBoolean(record['group_healing']),
    groupSupport: readBoolean(record['group_support']),
    level: readNumber(record['level']),
    magicLevel: readNumber(record['magic_level']),
    vocation: readStrings(record['vocation']),
  };
}

function mapSpellInformation(value: unknown): TibiaSpellInformationDto | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  return {
    amount: readNumber(record['amount']),
    city: readStrings(record['city']),
    cooldownAlone: readNumber(record['cooldown_alone']),
    cooldownGroup: readNumber(record['cooldown_group']),
    damageType: readString(record['damage_type']),
    formula: readString(record['formula']),
    groupAttack: readBoolean(record['group_attack']),
    groupHealing: readBoolean(record['group_healing']),
    groupSupport: readBoolean(record['group_support']),
    level: readNumber(record['level']),
    mana: readNumber(record['mana']),
    premiumOnly: readBoolean(record['premium_only']),
    price: readNumber(record['price']),
    soulPoints: readNumber(record['soul_points']),
    typeInstant: readBoolean(record['type_instant']),
    typeRune: readBoolean(record['type_rune']),
    vocation: readStrings(record['vocation']),
  };
}

function mapSpell(record: JsonRecord): TibiaSpellDto {
  return {
    formula: readString(record['formula']),
    groupAttack: readBoolean(record['group_attack']),
    groupHealing: readBoolean(record['group_healing']),
    groupSupport: readBoolean(record['group_support']),
    level: readNumber(record['level']),
    mana: readNumber(record['mana']),
    name: readRequiredString(record, 'name'),
    premiumOnly: readBoolean(record['premium_only']),
    price: readNumber(record['price']),
    spellId: readRequiredString(record, 'spell_id'),
    typeInstant: readBoolean(record['type_instant']),
    typeRune: readBoolean(record['type_rune']),
  };
}

function mapSpellDetails(record: JsonRecord): TibiaSpellDetailsDto {
  return {
    description: readString(record['description']),
    hasRuneInformation: readBoolean(record['has_rune_information']),
    hasSpellInformation: readBoolean(record['has_spell_information']),
    imageUrl: readString(record['image_url']),
    name: readRequiredString(record, 'name'),
    runeInformation: mapRuneInformation(record['rune_information']),
    spellId: readRequiredString(record, 'spell_id'),
    spellInformation: mapSpellInformation(record['spell_information']),
  };
}

export async function fetchSpell(spellId: string): Promise<TibiaSpellDetailsDto> {
  const payload = await fetchResource(`/spell/${encodeURIComponent(spellId)}`);
  const spell = readRecordValue(payload, 'spell');
  if (!spell) {
    throw new TibiaDataNotFoundError('Spell not found');
  }

  return mapSpellDetails(spell);
}

export async function fetchSpells(): Promise<TibiaSpellsOverviewDto> {
  const payload = await fetchResource('/spells');
  const spells = readRecordValue(payload, 'spells');
  if (!spells) {
    throw new TibiaDataNotFoundError('Spells not found');
  }

  return {
    spellList: readRecords(spells['spell_list']).map(mapSpell),
    spellsFilter: readString(spells['spells_filter']),
  };
}

function mapOnlinePlayer(record: JsonRecord): TibiaOnlinePlayerDto {
  return {
    level: readNumber(record['level']),
    name: readRequiredString(record, 'name'),
    vocation: readString(record['vocation']),
  };
}

function mapWorld(record: JsonRecord): TibiaWorldDto {
  return {
    battleyeDate: readString(record['battleye_date']),
    battleyeProtected: readBoolean(record['battleye_protected']),
    creationDate: readString(record['creation_date']),
    gameWorldType: readString(record['game_world_type']),
    location: readString(record['location']),
    name: readRequiredString(record, 'name'),
    onlinePlayers: readRecords(record['online_players']).map(mapOnlinePlayer),
    playersOnline: readNumber(record['players_online']),
    premiumOnly: readBoolean(record['premium_only']),
    pvpType: readString(record['pvp_type']),
    recordDate: readString(record['record_date']),
    recordPlayers: readNumber(record['record_players']),
    status: readString(record['status']),
    tournamentWorldType: readString(record['tournament_world_type']),
    transferType: readString(record['transfer_type']),
    worldQuestTitles: readStrings(record['world_quest_titles']),
  };
}

function mapWorldOverview(record: JsonRecord): TibiaWorldOverviewDto {
  return {
    battleyeDate: readString(record['battleye_date']),
    battleyeProtected: readBoolean(record['battleye_protected']),
    gameWorldType: readString(record['game_world_type']),
    location: readString(record['location']),
    name: readRequiredString(record, 'name'),
    playersOnline: readNumber(record['players_online']),
    premiumOnly: readBoolean(record['premium_only']),
    pvpType: readString(record['pvp_type']),
    status: readString(record['status']),
    tournamentWorldType: readString(record['tournament_world_type']),
    transferType: readString(record['transfer_type']),
  };
}

export async function fetchWorld(name: string): Promise<TibiaWorldDto> {
  const payload = await fetchResource(`/world/${encodeURIComponent(name)}`);
  const world = readRecordValue(payload, 'world');
  if (!world) {
    throw new TibiaDataNotFoundError('World not found');
  }

  return mapWorld(world);
}

export async function fetchWorlds(): Promise<TibiaWorldsOverviewDto> {
  const payload = await fetchResource('/worlds');
  const worlds = readRecordValue(payload, 'worlds');
  if (!worlds) {
    throw new TibiaDataNotFoundError('Worlds not found');
  }

  return {
    playersOnline: readNumber(worlds['players_online']),
    recordDate: readString(worlds['record_date']),
    recordPlayers: readNumber(worlds['record_players']),
    regularWorlds: readRecords(worlds['regular_worlds']).map(mapWorldOverview),
    tournamentWorlds: readRecords(worlds['tournament_worlds']).map(mapWorldOverview),
  };
}
