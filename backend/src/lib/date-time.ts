/**
 * Jedyny format czasu na granicy API: ISO 8601 w UTC (`2026-08-26T13:36:00.000Z`).
 *
 * Dlaczego konwersja siedzi w TypeScripcie, a nie w SQL-u: formatu nie da się
 * trzymać w stałej i wstawiać do tagged template Neona - interpolowany string
 * stałby się parametrem bindowanym, a nie fragmentem SQL. Zapytania zwracają
 * więc surowe kolumny TIMESTAMPTZ (niosą offset), a mapper wiersza -> DTO
 * przepuszcza je przez `toIsoUtc`.
 *
 * Kolumn typu DATE (np. `users.birth_date`) tu nie przepuszczamy - to data
 * kalendarzowa bez strefy, konwersja przesunęłaby ją o dobę.
 */
export const API_TIMESTAMP_FORMAT = 'ISO-8601-UTC';

/** Sterownik HTTP Neona zwraca TIMESTAMPTZ jako `Date` albo tekst Postgresa. */
export type SqlTimestamp = Date | string;

export function toIsoUtc(value: SqlTimestamp): string {
  const parsed = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString();
}

export function toIsoUtcOrNull(value: SqlTimestamp | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return toIsoUtc(value) || null;
}
