import type { AuthGoogleUserDto } from '@shared/api-contract';
import type { AuthUser } from './auth-session';

const FALLBACK_FULL_NAME = 'Użytkownik Google';

function normalizeNamePart(value: string | null | undefined): string {
  return value?.trim() || '';
}

function resolveFullName(user: AuthGoogleUserDto, givenName: string, familyName: string): string {
  const fullNameFromClaim = user.name?.trim() || '';
  if (fullNameFromClaim) {
    return fullNameFromClaim;
  }

  return `${givenName} ${familyName}`.trim() || FALLBACK_FULL_NAME;
}

/**
 * Single mapping from the API user DTO to the session model. `AuthCurrentUserDto`
 * extends `AuthGoogleUserDto`, so both login and `/auth/me` responses fit here.
 */
export function mapAuthUser(user: AuthGoogleUserDto): AuthUser {
  const givenName = normalizeNamePart(user.givenName);
  const familyName = normalizeNamePart(user.familyName);

  return {
    givenName,
    familyName,
    fullName: resolveFullName(user, givenName, familyName),
    email: user.email,
    picture: user.picture,
    role: user.role,
    phone: user.phone,
    birthDate: user.birthDate,
    description: user.description,
    referralCode: user.referralCode,
    referredByCode: user.referredByCode,
    registeredAt: user.registeredAt || '',
    lastLoginAt: user.lastLoginAt || '',
    updatedAt: user.updatedAt || '',
  };
}
