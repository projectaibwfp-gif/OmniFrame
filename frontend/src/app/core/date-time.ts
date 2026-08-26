import { formatDate } from '@angular/common';

/**
 * Jedyny format wyświetlania czasu w aplikacji. Backend zwraca timestampy w
 * jednym formacie (ISO 8601 UTC), a tutaj zamieniamy je na czas lokalny
 * przeglądarki - dlatego godzina na Vercelu (UTC) i lokalnie jest ta sama.
 */
export const DATE_TIME_FORMAT = 'dd.MM.yyyy HH:mm';
export const DATE_FORMAT = 'dd.MM.yyyy';
export const EMPTY_DATE_PLACEHOLDER = '-';

/**
 * Wzorce są w pełni numeryczne, więc locale nie zmienia wyniku - podajemy stałe
 * `en-US`, żeby nie wymagać rejestracji danych locale dla `pl`.
 */
const FORMATTING_LOCALE = 'en-US';

/** Klucz dnia w strefie przeglądarki - do grupowania rekordów po dacie. */
const DAY_KEY_FORMAT = 'yyyy-MM-dd';

/** Wartości typu DATE z bazy (np. data urodzenia) nie mają strefy. */
const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const UTC_TIME_ZONE = 'UTC';

function parse(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateTime(value: string | null | undefined): string {
  const parsed = parse(value);

  return parsed ? formatDate(parsed, DATE_TIME_FORMAT, FORMATTING_LOCALE) : EMPTY_DATE_PLACEHOLDER;
}

export function formatDateOnly(value: string | null | undefined): string {
  const parsed = parse(value);
  if (!parsed) {
    return EMPTY_DATE_PLACEHOLDER;
  }

  // Data kalendarzowa parsuje się jako północ UTC - bez wymuszenia UTC strefy
  // ujemne przesunęłyby ją na poprzedni dzień.
  const timeZone = CALENDAR_DATE_PATTERN.test(value ?? '') ? UTC_TIME_ZONE : undefined;

  return formatDate(parsed, DATE_FORMAT, FORMATTING_LOCALE, timeZone);
}

export function toLocalDayKey(value: string | null | undefined): string {
  const parsed = parse(value);

  return parsed ? formatDate(parsed, DAY_KEY_FORMAT, FORMATTING_LOCALE) : '';
}
