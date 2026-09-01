/**
 * Wspólne schematy runtime dla payloadów API. Używane po stronie backendu do
 * walidacji requestów oraz po stronie frontendu do walidacji formularzy przed
 * wysłaniem. Struktura odpowiada DTO w `api-contract.ts`.
 */

import {
  enumSchema,
  intFromStringSchema,
  objectSchema,
  stringSchema,
  withDefault,
  type Infer,
  type Schema,
} from "./validation";

const REFERRAL_CODE_PATTERN = /^[A-Za-z0-9._-]+$/;
const REFERRAL_CODE_MAX_LENGTH = 64;
const CHARACTER_NAME_MAX_LENGTH = 30;
const WORLD_MAX_LENGTH = 30;
const GOOGLE_ID_MAX_LENGTH = 64;
const HIGHSCORES_MIN_PAGE = 1;
const HIGHSCORES_DEFAULT_PAGE = 1;
const HIGHSCORES_DEFAULT_PAGE_SIZE = 50;
const HIGHSCORES_MAX_PAGE_SIZE = 200;

export const AuthGoogleRequestSchema = objectSchema({
  credential: stringSchema(),
  state: stringSchema(),
});

export const ReferralCaptureRequestSchema = objectSchema({
  referralCode: stringSchema({
    pattern: REFERRAL_CODE_PATTERN,
    maxLength: REFERRAL_CODE_MAX_LENGTH,
  }),
});

export const LinkMainCharacterRequestSchema = objectSchema({
  name: stringSchema({ maxLength: CHARACTER_NAME_MAX_LENGTH }),
});

export const CharacterNameParamSchema = objectSchema({
  name: stringSchema({ maxLength: CHARACTER_NAME_MAX_LENGTH }),
});

export const WorldParamSchema = objectSchema({
  world: stringSchema({ maxLength: WORLD_MAX_LENGTH }),
});

export const GoogleIdParamSchema = objectSchema({
  googleId: stringSchema({ maxLength: GOOGLE_ID_MAX_LENGTH }),
});

export const HighscoresSnapshotsQuerySchema = objectSchema({
  page: withDefault(
    intFromStringSchema({ min: HIGHSCORES_MIN_PAGE }),
    HIGHSCORES_DEFAULT_PAGE,
  ),
  pageSize: withDefault(intFromStringSchema({ min: 1 }), HIGHSCORES_DEFAULT_PAGE_SIZE),
  world: withDefault(stringSchema({ maxLength: WORLD_MAX_LENGTH }), ""),
  sortDir: withDefault(enumSchema(["asc", "desc"] as const), "desc"),
});

export type AuthGoogleRequestInput = Infer<typeof AuthGoogleRequestSchema>;
export type ReferralCaptureRequestInput = Infer<typeof ReferralCaptureRequestSchema>;
export type LinkMainCharacterRequestInput = Infer<typeof LinkMainCharacterRequestSchema>;
export type CharacterNameParamInput = Infer<typeof CharacterNameParamSchema>;
export type WorldParamInput = Infer<typeof WorldParamSchema>;
export type GoogleIdParamInput = Infer<typeof GoogleIdParamSchema>;
export type HighscoresSnapshotsQueryInput = Infer<typeof HighscoresSnapshotsQuerySchema>;

export type SharedSchema<T> = Schema<T>;
