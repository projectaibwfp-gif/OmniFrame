/**
 * Jedyny format liczb w aplikacji (separator tysięcy). Domyślnie `en-US`, bo
 * wartości z Tibii (EXP, gold, ranking) pokazujemy tak, jak robi to gra.
 */
export const NUMBER_FORMAT_LOCALE = 'en-US';
export const POLISH_NUMBER_FORMAT_LOCALE = 'pl-PL';

const formattersByLocale = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string): Intl.NumberFormat {
  const cached = formattersByLocale.get(locale);
  if (cached) {
    return cached;
  }

  const formatter = new Intl.NumberFormat(locale);
  formattersByLocale.set(locale, formatter);
  return formatter;
}

export function formatNumber(value: number, locale: string = NUMBER_FORMAT_LOCALE): string {
  return getFormatter(locale).format(value);
}
