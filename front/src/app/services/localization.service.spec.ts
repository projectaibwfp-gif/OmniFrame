import { describe, expect, it, beforeEach } from 'vitest';
import { LocalizationService } from './localization.service';

describe('LocalizationService', () => {
  let service: LocalizationService;

  beforeEach(() => {
    // Mock navigator.language for testing
    const navigatorMock = {
      language: 'en-US',
    };
    Object.defineProperty(window, 'navigator', {
      value: navigatorMock,
      configurable: true,
    });

    service = new LocalizationService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default locale en for English browser', () => {
    expect(service.getLocale()).toBe('en');
  });

  it('should set locale to pl', () => {
    service.setLocale('pl');
    expect(service.getLocale()).toBe('pl');
  });

  it('should update currentLocale signal', () => {
    service.setLocale('pl');
    expect(service.currentLocale()).toBe('pl');
  });

  it('should support both en and pl locales', () => {
    service.setLocale('en');
    expect(service.currentLocale()).toBe('en');

    service.setLocale('pl');
    expect(service.currentLocale()).toBe('pl');
  });
});
