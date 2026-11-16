import type { CharacterLookupJobStatus, UserRole } from '@shared/api-contract';

export const DESCRIPTION_MAX_LENGTH = 500;
export const DEFAULT_USER_ROLE: UserRole = 'user';
export const PHONE_MIN_DIGITS = 9;
export const MIN_USER_AGE_YEARS = 13;

export const CharacterLookupJobState = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const satisfies Record<string, CharacterLookupJobStatus>;

export const CHARACTER_LOOKUP_JOB_STATUSES: CharacterLookupJobStatus[] =
  Object.values(CharacterLookupJobState);
