export type ApiResponse<T> = {
  data: T;
};

export type UserRole = "admin" | "user" | "moderator";
export type ProductStatus = "active" | "draft";

export interface AuthStateDto {
  state: string;
}

export interface AuthGoogleRequestDto {
  credential: string;
  state: string;
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
}

export interface AuthCurrentUserDto extends AuthGoogleUserDto {
  id: number;
  googleId: string;
  emailVerified: boolean;
  locale: string | null;
}

export interface AuthGoogleResponseDto {
  user: AuthGoogleUserDto;
}

export interface AuthCurrentUserResponseDto {
  user: AuthCurrentUserDto;
}

export interface ReferralCaptureRequestDto {
  referralCode: string;
}

export interface ReferralCaptureResponseDto {
  referralCode: string;
  stored: boolean;
}

export interface ProductDto {
  id: number;
  name: string;
  status: ProductStatus;
  category: string;
  description: string | null;
  createdById: number | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateRequestDto {
  name: string;
  status: ProductStatus;
  category: string;
  description?: string | null;
}

export interface ProductUpdateRequestDto {
  name?: string;
  status?: ProductStatus;
  category?: string;
  description?: string | null;
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
