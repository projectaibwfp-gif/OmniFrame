import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { LocalizationService, type Locale } from './services/localization.service';
import { LanguageSwitcherComponent } from './components/language-switcher.component';
import { ThemeSwitcherComponent } from './components/theme-switcher.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    LanguageSwitcherComponent,
    ThemeSwitcherComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly authService = inject(AuthService);
  readonly localizationService = inject(LocalizationService);
  readonly currentUser = this.authService.user;
  readonly currentLocale = this.localizationService.currentLocale;
  readonly navOpen = signal(false);

  readonly navItems = computed(() => {
    const locale = this.currentLocale();
    const translations = this.getNavTranslations(locale);
    return [
      { path: '/boosted', label: translations.boostedData, icon: '⚔', exact: false },
      { path: '/character', label: translations.character, icon: '🧙', exact: false },
      { path: '/hunting-places', label: translations.huntingPlaces, icon: '🗺️', exact: false },
      { path: '/charm-places', label: translations.charmPlaces, icon: '✨', exact: false },
      { path: '/highscores-snapshots', label: translations.snapshots, icon: '📊', exact: false },
      { path: '/', label: translations.dashboard, icon: '▦', exact: true },
      { path: '/products', label: translations.products, icon: '▤', exact: false },
      { path: '/users', label: translations.users, icon: '👤', exact: false },
      { path: '/profile', label: translations.profile, icon: '◌', exact: false },
      { path: '/about', label: translations.about, icon: 'ⓘ', exact: false },
    ] as const;
  });

  readonly initials = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return '';
    }
    const fullName = `${user.givenName} ${user.familyName}`.trim() || user.fullName;
    const parts = fullName.split(/\s+/).filter(Boolean);
    return parts
      .slice(0, 2)
      .map((value) => value.charAt(0).toUpperCase())
      .join('');
  });

  private readonly router = inject(Router);

  toggleMobileNav(): void {
    this.navOpen.update((value) => !value);
  }

  closeMobileNav(): void {
    this.navOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }

  setLocale(locale: Locale): void {
    this.localizationService.setLocale(locale);
  }

  private getNavTranslations(locale: Locale): {
    dashboard: string;
    products: string;
    boostedData: string;
    character: string;
    huntingPlaces: string;
    charmPlaces: string;
    snapshots: string;
    users: string;
    profile: string;
    about: string;
  } {
    const translations = {
      en: {
        dashboard: 'Dashboard',
        products: 'Products',
        boostedData: 'Boosted data',
        character: 'Character lookup',
        huntingPlaces: 'Hunting places',
        charmPlaces: 'Charm places',
        snapshots: 'Highscores DB',
        users: 'Users',
        profile: 'Profile',
        about: 'About project',
      },
      pl: {
        dashboard: 'Pulpit',
        products: 'Produkty',
        boostedData: 'Boosted dane',
        character: 'Wyszukaj postać',
        huntingPlaces: 'Miejsca polowań',
        charmPlaces: 'Charm places',
        snapshots: 'Highscores DB',
        users: 'Użytkownicy',
        profile: 'Profil',
        about: 'O projekcie',
      },
    };
    return translations[locale];
  }
}
