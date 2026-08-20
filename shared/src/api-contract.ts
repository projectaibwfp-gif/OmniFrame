export type ApiResponse<T> = {
  data: T;
};

export type UserRole = 'admin' | 'user' | 'moderator';
export type ProductStatus = 'active' | 'draft';

export interface AuthStateDto {
  state: string;
}

export interface AuthGoogleRequestDto {
  credential: string;
  state: string;
}

export interface AuthGoogleUserDto {
  given_name: string | null;
  family_name: string | null;
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
  google_id: string;
  email_verified: boolean;
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
  google_id: string;
  email: string;
  email_verified: boolean;
  role: UserRole;
  name: string | null;
  given_name: string | null;
  family_name: string | null;
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
