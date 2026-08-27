import type { UserRole } from '@shared/api-contract';

export const DESCRIPTION_MAX_LENGTH = 500;
export const USER_ROLES: readonly UserRole[] = ['admin', 'user', 'moderator'];
export const DEFAULT_USER_ROLE: UserRole = 'user';
export const PHONE_MIN_DIGITS = 9;
export const MIN_USER_AGE_YEARS = 13;
