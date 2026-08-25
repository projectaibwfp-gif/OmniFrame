import type { UserRole } from '@shared/api-contract';

export type AuthRole = UserRole;

export interface AuthUser {
  givenName: string;
  familyName: string;
  fullName: string;
  email: string;
  picture: string | null;
  role: AuthRole;
  phone?: string | null;
  birthDate?: string | null;
  description?: string | null;
  referralCode: string;
  referredByCode: string | null;
  registeredAt: string;
  lastLoginAt: string;
  updatedAt: string;
}
