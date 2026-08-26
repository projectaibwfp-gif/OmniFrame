import type { ProductStatus, UserRole } from '@shared/api-contract';

export const PRODUCT_NAME_MAX_LENGTH = 120;
export const PRODUCT_CATEGORY_MAX_LENGTH = 80;
export const DESCRIPTION_MAX_LENGTH = 500;
export const DEFAULT_PRODUCT_CATEGORY = 'General';
export const PRODUCT_STATUSES: readonly ProductStatus[] = ['active', 'draft'];
export const USER_ROLES: readonly UserRole[] = ['admin', 'user', 'moderator'];
export const DEFAULT_USER_ROLE: UserRole = 'user';
export const PHONE_MIN_DIGITS = 9;
export const MIN_USER_AGE_YEARS = 13;
