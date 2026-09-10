export type ApiResponse<T> = {
  data: T;
};

// ---------------------------------------------------------------------------
// Unified creature / monster model
// Single source of truth for creature data across loot, hunting-places,
// boosted bosses/creatures and future API endpoints.
// ---------------------------------------------------------------------------

/** Lightweight reference to a creature — used for cross-linking between modules. */
export interface CreatureRef {
  name: string;
  slug: string;
}

/**
 * Numeric resistance percentages (Tibia convention).
 * Positive = creature takes MORE damage (weak to that element).
 * Negative = creature takes LESS damage (resistant).
 * -100 = immune.
 */
export interface CreatureResistances {
  physical: number;
  fire: number;
  ice: number;
  energy: number;
  earth: number;
  holy: number;
  death: number;
}

/** Loot entry on a creature detail page. */
export interface CreatureLootEntry {
  name: string;
  chance: string;
  notes?: string;
}

/**
 * Unified creature detail — merges data from hunting-places JSON,
 * boosted boss/creature static data and (future) API responses.
 * Every field except name/slug/boss is optional because not every
 * source provides every field.
 */
export interface CreatureDetailDto {
  name: string;
  slug: string;
  imageUrl?: string;
  health?: number;
  experience?: number;
  boss: boolean;
  charmPoints?: number;
  resistances?: CreatureResistances;
  attackStyle?: string[];
  loot?: CreatureLootEntry[];
  shortDescription?: string;
  accessQuest?: string;
  location?: string;
  soloLevel?: string;
  groupLevel?: string;
}

export interface ApiErrorDto {
  code: string;
  message: string;
}

export interface ApiErrorResponseDto {
  error: ApiErrorDto;
}

export type UserRole = "admin" | "user" | "moderator";

export interface AuthStateDto {
  state: string;
}

export interface AuthGoogleRequestDto {
  credential: string;
  state: string;
}

export interface UserMainCharacterDto {
  name: string;
  world: string | null;
  vocation: string | null;
  level: number | null;
  linkedAt: string;
}

export interface AuthGoogleUserDto {
  givenName: string | null;
  familyName: string | null;
  name: string | null;
  email: string;
  picture: string | null;
  role: UserRole;
  referralCode: string;
  referredByCode: string | null;
  phone?: string | null;
  birthDate?: string | null;
  description?: string | null;
  registeredAt?: string;
  lastLoginAt?: string;
  updatedAt?: string;
  mainCharacter?: UserMainCharacterDto | null;
}

export interface AuthCurrentUserDto extends AuthGoogleUserDto {
  id: number;
  googleId: string;
  emailVerified: boolean;
  locale: string | null;
  mainCharacter: UserMainCharacterDto | null;
}

export interface AuthGoogleResponseDto {
  user: AuthGoogleUserDto;
}

export interface AuthCurrentUserResponseDto {
  user: AuthCurrentUserDto;
}

export interface LinkMainCharacterRequestDto {
  name: string;
}

export interface ReferralCaptureRequestDto {
  referralCode: string;
}

export interface ReferralCaptureResponseDto {
  referralCode: string;
  stored: boolean;
}

export interface UsersListItemDto {
  id: number;
  googleId: string;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  name: string | null;
  givenName: string | null;
  familyName: string | null;
  picture: string | null;
  locale: string | null;
  referralCode: string;
  referredByCode: string | null;
  referredByName: string | null;
  registeredAt: string;
  lastLoginAt: string;
}

export interface UsersListResponseDto {
  data: UsersListItemDto[];
  total: number;
}

export interface DashboardOverviewDto {
  totalUsers: number;
  verifiedUsers: number;
  loginsToday: number;
  newUsersToday: number;
  referredUsers: number;
  referralShare: number;
  verifiedShare: number;
}

export interface DashboardActivityPointDto {
  label: string;
  signups: number;
  logins: number;
  referredSignups: number;
}

export interface DashboardRecentUserDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  lastLoginAt: string;
  registeredAt: string;
  referredByCode: string | null;
}

export interface DashboardTopReferrerDto {
  id: number;
  name: string;
  email: string;
  referralCode: string;
  referrals: number;
}

export interface DashboardDto {
  overview: DashboardOverviewDto;
  activity: DashboardActivityPointDto[];
  recentUsers: DashboardRecentUserDto[];
  topReferrers: DashboardTopReferrerDto[];
}

export interface BoostableBossDto {
  name: string;
  imageUrl: string;
  featured: boolean;
}

export interface BoostableBossesDto {
  boosted: BoostableBossDto | null;
  boostableBossList: BoostableBossDto[];
}

export interface TibiaCreatureDto {
  name: string;
  race: string;
  imageUrl: string;
  featured: boolean;
}

export interface TibiaCreaturesDto {
  boosted: TibiaCreatureDto | null;
  creatureList: TibiaCreatureDto[];
}

export type CharacterProgressTargetKind = "boss" | "creature";

export type CharacterProgressStatus = "first-time" | "completed";

export interface CharacterProgressEntryDto {
  characterName: string;
  targetKind: CharacterProgressTargetKind;
  targetName: string;
  status: CharacterProgressStatus;
  updatedAt: string;
}

export interface CharacterProgressListDto {
  entries: CharacterProgressEntryDto[];
}

export interface CharacterProgressUpdateRequestDto {
  targetKind: CharacterProgressTargetKind;
  targetName: string;
  status: CharacterProgressStatus;
}

export interface CharacterProgressUpdateResponseDto {
  entry: CharacterProgressEntryDto;
}

export interface TibiaCharacterGuildDto {
  name: string;
  rank: string;
}

export interface TibiaCharacterAchievementDto {
  name: string;
  grade: number | null;
  secret: boolean;
}

export interface TibiaCharacterOtherCharacterDto {
  name: string;
  world: string | null;
  status: string | null;
  deleted: boolean;
  main: boolean;
  traded: boolean;
}

export type TibiaCharacterExperienceStatus =
  "found" | "outside_top1000" | "unavailable";

export interface TibiaCharacterExperienceDto {
  status: TibiaCharacterExperienceStatus;
  exactExperience: number | null;
  rank: number | null;
  vocation: string | null;
  world: string | null;
  highscoreAgeMinutes: number | null;
  lookupLog?: string;
}

export interface TibiaCharacterDto {
  name: string;
  sex: string | null;
  title: string | null;
  vocation: string | null;
  level: number | null;
  achievementPoints: number | null;
  world: string | null;
  residence: string | null;
  marriedTo: string | null;
  lastLogin: string | null;
  accountStatus: string | null;
  unlockedTitles: number | null;
  comment: string | null;
  guild: TibiaCharacterGuildDto | null;
  formerNames: string[];
  formerWorlds: string[];
  accountCreated: string | null;
  loyaltyTitle: string | null;
  achievements: TibiaCharacterAchievementDto[];
  otherCharacters: TibiaCharacterOtherCharacterDto[];
  experience: TibiaCharacterExperienceDto | null;
}

export interface TibiaCharacterHistoryEntryDto {
  id: number;
  checkedAt: string;
  name: string;
  world: string | null;
  vocation: string | null;
  level: number | null;
  exactExperience: number | null;
  experienceStatus: TibiaCharacterExperienceStatus | null;
  experienceRank: number | null;
}

export interface TibiaCharacterLookupDto {
  character: TibiaCharacterDto;
  history: TibiaCharacterHistoryEntryDto[];
}

export interface HighscoresSnapshotRecordDto {
  id: number;
  characterName: string;
  world: string;
  vocation: string;
  level: number;
  rank: number;
  exactExperience: number;
  checkedAt: string;
}

export interface HighscoresSnapshotsListDto {
  data: HighscoresSnapshotRecordDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sortBy: "level";
  sortDir: "asc" | "desc";
  world: string | null;
  worlds: string[];
}

export interface TibiaKillStatisticsEntryDto {
  race: string;
  lastDayPlayersKilled: number;
  lastDayKilled: number;
  lastWeekPlayersKilled: number;
  lastWeekKilled: number;
}

export interface TibiaKillStatisticsWorldDto {
  world: string;
  updatedAt: string | null;
  entries: TibiaKillStatisticsEntryDto[];
}

export interface TibiaNewsDto {
  id: number;
  date: string;
  category: string;
  type: string;
  title: string;
  url: string;
  urlApi: string;
}

export interface TibiaNewsListDto {
  news: TibiaNewsDto[];
  cachedAt: string;
}

export interface TibiaFansiteContentTypeDto {
  statistics: boolean;
  texts: boolean;
  tools: boolean;
  wiki: boolean;
}

export interface TibiaFansiteSocialMediaDto {
  discord: boolean;
  facebook: boolean;
  instagram: boolean;
  reddit: boolean;
  twitch: boolean;
  twitter: boolean;
  youtube: boolean;
}

export interface TibiaFansiteDto {
  contact: string | null;
  contentType: TibiaFansiteContentTypeDto | null;
  fansiteItem: boolean;
  fansiteItemUrl: string | null;
  homepage: string | null;
  languages: string[];
  logoUrl: string | null;
  name: string;
  socialMedia: TibiaFansiteSocialMediaDto | null;
  specials: string[];
}

export interface TibiaFansitesDto {
  promoted: TibiaFansiteDto[];
  supported: TibiaFansiteDto[];
}

export interface TibiaGuildhallDto {
  name: string | null;
  paidUntil: string | null;
  world: string | null;
}

export interface TibiaInvitedGuildMemberDto {
  date: string | null;
  name: string;
}

export interface TibiaGuildMemberDto {
  joined: string | null;
  level: number | null;
  name: string;
  rank: string | null;
  status: string | null;
  title: string | null;
  vocation: string | null;
}

export interface TibiaGuildDto {
  active: boolean;
  description: string | null;
  disbandCondition: string | null;
  disbandDate: string | null;
  founded: string | null;
  guildhalls: TibiaGuildhallDto[];
  homepage: string | null;
  inWar: boolean;
  invites: TibiaInvitedGuildMemberDto[];
  logoUrl: string | null;
  members: TibiaGuildMemberDto[];
  membersInvited: number | null;
  membersTotal: number | null;
  name: string;
  openApplications: boolean;
  playersOffline: number | null;
  playersOnline: number | null;
  world: string | null;
}

export interface TibiaGuildOverviewDto {
  description: string | null;
  logoUrl: string | null;
  name: string;
}

export interface TibiaGuildsOverviewDto {
  active: TibiaGuildOverviewDto[];
  formation: TibiaGuildOverviewDto[];
  world: string | null;
}

export interface TibiaHouseAuctionDto {
  auctionEnd: string | null;
  auctionOngoing: boolean;
  currentBid: number | null;
  currentBidder: string | null;
}

export interface TibiaHouseRentalDto {
  movingDate: string | null;
  owner: string | null;
  ownerSex: string | null;
  paidUntil: string | null;
  transferAccept: boolean;
  transferPrice: number | null;
  transferReceiver: string | null;
}

export interface TibiaHouseStatusDto {
  auction: TibiaHouseAuctionDto | null;
  isAuctioned: boolean;
  isMoving: boolean;
  isRented: boolean;
  isTransfering: boolean;
  original: string | null;
  rental: TibiaHouseRentalDto | null;
}

export interface TibiaHouseDto {
  beds: number | null;
  houseId: number | null;
  img: string | null;
  name: string;
  rent: number | null;
  size: number | null;
  status: TibiaHouseStatusDto | null;
  town: string | null;
  type: string | null;
  world: string | null;
}

export interface TibiaHouseOverviewAuctionDto {
  currentBid: number | null;
  finished: boolean;
  timeLeft: string | null;
}

export interface TibiaHouseOverviewDto {
  auction: TibiaHouseOverviewAuctionDto | null;
  auctioned: boolean;
  houseId: number | null;
  name: string;
  rent: number | null;
  rented: boolean;
  size: number | null;
}

export interface TibiaHousesOverviewDto {
  guildhallList: TibiaHouseOverviewDto[];
  houseList: TibiaHouseOverviewDto[];
  town: string | null;
  world: string | null;
}

export interface TibiaRuneInformationDto {
  damageType: string | null;
  groupAttack: boolean;
  groupHealing: boolean;
  groupSupport: boolean;
  level: number | null;
  magicLevel: number | null;
  vocation: string[];
}

export interface TibiaSpellInformationDto {
  amount: number | null;
  city: string[];
  cooldownAlone: number | null;
  cooldownGroup: number | null;
  damageType: string | null;
  formula: string | null;
  groupAttack: boolean;
  groupHealing: boolean;
  groupSupport: boolean;
  level: number | null;
  mana: number | null;
  premiumOnly: boolean;
  price: number | null;
  soulPoints: number | null;
  typeInstant: boolean;
  typeRune: boolean;
  vocation: string[];
}

export interface TibiaSpellDto {
  formula: string | null;
  groupAttack: boolean;
  groupHealing: boolean;
  groupSupport: boolean;
  level: number | null;
  mana: number | null;
  name: string;
  premiumOnly: boolean;
  price: number | null;
  spellId: string;
  typeInstant: boolean;
  typeRune: boolean;
}

export interface TibiaSpellDetailsDto {
  description: string | null;
  hasRuneInformation: boolean;
  hasSpellInformation: boolean;
  imageUrl: string | null;
  name: string;
  runeInformation: TibiaRuneInformationDto | null;
  spellId: string;
  spellInformation: TibiaSpellInformationDto | null;
}

export interface TibiaSpellsOverviewDto {
  spellList: TibiaSpellDto[];
  spellsFilter: string | null;
}

export interface TibiaOnlinePlayerDto {
  level: number | null;
  name: string;
  vocation: string | null;
}

export interface TibiaWorldDto {
  battleyeDate: string | null;
  battleyeProtected: boolean;
  creationDate: string | null;
  gameWorldType: string | null;
  location: string | null;
  name: string;
  onlinePlayers: TibiaOnlinePlayerDto[];
  playersOnline: number | null;
  premiumOnly: boolean;
  pvpType: string | null;
  recordDate: string | null;
  recordPlayers: number | null;
  status: string | null;
  tournamentWorldType: string | null;
  transferType: string | null;
  worldQuestTitles: string[];
}

export interface TibiaWorldOverviewDto {
  battleyeDate: string | null;
  battleyeProtected: boolean;
  gameWorldType: string | null;
  location: string | null;
  name: string;
  playersOnline: number | null;
  premiumOnly: boolean;
  pvpType: string | null;
  status: string | null;
  tournamentWorldType: string | null;
  transferType: string | null;
}

export interface TibiaWorldsOverviewDto {
  playersOnline: number | null;
  recordDate: string | null;
  recordPlayers: number | null;
  regularWorlds: TibiaWorldOverviewDto[];
  tournamentWorlds: TibiaWorldOverviewDto[];
}
