export type AuthRole = 'admin' | 'user' | 'moderator';

export interface AuthUser {
  givenName: string;
  familyName: string;
  fullName: string;
  role: AuthRole;
}
