import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');

    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    service = new ThemeService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with dark theme by default', () => {
    expect(service.getTheme()).toBe('dark');
  });

  it('should set theme to dark', () => {
    service.setTheme('dark');
    expect(service.getTheme()).toBe('dark');
  });

  it('should update currentTheme signal', () => {
    service.setTheme('dark');
    expect(service.currentTheme()).toBe('dark');
  });

  it('should persist theme to localStorage', () => {
    service.setTheme('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should apply theme attribute to html element', () => {
    service.setTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    service.setTheme('light');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('should restore theme from localStorage on init', () => {
    localStorage.setItem('theme', 'dark');
    const newService = new ThemeService();
    expect(newService.getTheme()).toBe('dark');
  });
});
