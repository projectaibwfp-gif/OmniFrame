import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly currentTheme = signal<Theme>('light');

  constructor() {
    this.initializeTheme();
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.applyTheme(theme);
    localStorage.setItem('theme', theme);
  }

  getTheme(): Theme {
    return this.currentTheme();
  }

  private initializeTheme(): void {
    const saved = localStorage.getItem('theme') as Theme | null;

    if (saved) {
      this.currentTheme.set(saved);
      this.applyTheme(saved);
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme: Theme = prefersDark ? 'dark' : 'light';
    this.currentTheme.set(theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
  }
}
