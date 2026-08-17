export type AuthRole = 'admin' | 'user' | 'moderator';

export interface AuthUser {
  givenName: string;
  familyName: string;
  fullName: string;
  email: string;
  picture: string | null;
  role: AuthRole;
  referralCode: string;
  referredByCode: string | null;
}
