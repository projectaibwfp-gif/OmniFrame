import { describe, expect, it } from 'vitest';
import { POLISH_NUMBER_FORMAT_LOCALE, formatNumber } from './number-format';
import { AppNumberPipe } from './number-format.pipe';

describe('formatNumber', () => {
  it('groups thousands with the default en-US separator', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('leaves small numbers untouched', () => {
    expect(formatNumber(42)).toBe('42');
  });

  it('supports an explicit locale', () => {
    expect(formatNumber(1234567, POLISH_NUMBER_FORMAT_LOCALE)).toBe(
      new Intl.NumberFormat(POLISH_NUMBER_FORMAT_LOCALE).format(1234567),
    );
  });
});

describe('AppNumberPipe', () => {
  it('formats with the default locale', () => {
    expect(new AppNumberPipe().transform(9876)).toBe('9,876');
  });
});
