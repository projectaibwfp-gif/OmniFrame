import { Injectable, signal } from '@angular/core';

export type Locale = 'en' | 'pl';

@Injectable({
  providedIn: 'root',
})
export class LocalizationService {
  readonly currentLocale = signal<Locale>('en');

  constructor() {
    this.initializeLocale();
  }

  setLocale(locale: Locale): void {
    this.currentLocale.set(locale);
  }

  getLocale(): Locale {
    return this.currentLocale();
  }

  private initializeLocale(): void {
    const browserLang = navigator.language.split('-')[0] as Locale;
    const supportedLocales: Locale[] = ['en', 'pl'];
    const locale = supportedLocales.includes(browserLang) ? browserLang : 'en';
    this.currentLocale.set(locale);
  }
}
