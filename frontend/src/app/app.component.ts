import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { BoostedService } from './services/boosted.service';
import { LocalizationService, type Locale } from './services/localization.service';
import { MainCharacterService } from './services/main-character.service';
import { LanguageSwitcherComponent } from './components/language-switcher.component';
import { ThemeSwitcherComponent } from './components/theme-switcher.component';

const INITIALS_MAX_CHARS = 2;

interface NavTranslations {
  dashboard: string;
  news: string;
  boostedData: string;
  character: string;
  huntingPlaces: string;
  charmPlaces: string;
  quests: string;
  snapshots: string;
  users: string;
  profile: string;
  about: string;
}

const NAV_TRANSLATIONS: Record<Locale, NavTranslations> = {
  en: {
    dashboard: 'Dashboard',
    news: 'News',
    boostedData: 'Boosted data',
    character: 'Character lookup',
    huntingPlaces: 'Hunting places',
    charmPlaces: 'Charm places',
    quests: 'Quests',
    snapshots: 'Highscores DB',
    users: 'Users',
    profile: 'Profile',
    about: 'About project',
  },
  pl: {
    dashboard: 'Pulpit',
    news: 'Aktualności',
    boostedData: 'Boosted dane',
    character: 'Wyszukaj postać',
    huntingPlaces: 'Miejsca polowań',
    charmPlaces: 'Charm places',
    quests: 'Questy',
    snapshots: 'Highscores DB',
    users: 'Użytkownicy',
    profile: 'Profil',
    about: 'O projekcie',
  },
};

@Component({
  selector: 'app-root',
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
  protected readonly authService = inject(AuthService);
  protected readonly localizationService = inject(LocalizationService);
  protected readonly mainCharacterService = inject(MainCharacterService);
  protected readonly boostedService = inject(BoostedService);
  protected readonly currentUser = this.authService.user;
  protected readonly currentLocale = this.localizationService.currentLocale;
  protected readonly mainCharacter = this.mainCharacterService.character;
  protected readonly mainCharacterBadge = this.mainCharacterService.badge;
  protected readonly boostedBoss = this.boostedService.boostedBoss;
  protected readonly boostedCreature = this.boostedService.boostedCreature;
  protected readonly navOpen = signal(false);

  protected readonly navItems = computed(() => {
    const translations = NAV_TRANSLATIONS[this.currentLocale()];
    return [
      { path: '/news', label: translations.news, icon: '📰', exact: false },
      { path: '/boosted', label: translations.boostedData, icon: '⚔', exact: false },
      { path: '/character', label: translations.character, icon: '🧙', exact: false },
      { path: '/hunting-places', label: translations.huntingPlaces, icon: '🗺️', exact: false },
      { path: '/charm-places', label: translations.charmPlaces, icon: '✨', exact: false },
      { path: '/quests', label: translations.quests, icon: '📜', exact: false },
      { path: '/highscores-snapshots', label: translations.snapshots, icon: '📊', exact: false },
      { path: '/', label: translations.dashboard, icon: '▦', exact: true },
      { path: '/users', label: translations.users, icon: '👤', exact: false },
      { path: '/profile', label: translations.profile, icon: '◌', exact: false },
      { path: '/about', label: translations.about, icon: 'ⓘ', exact: false },
    ] as const;
  });

  protected readonly initials = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return '';
    }
    const fullName = `${user.givenName} ${user.familyName}`.trim() || user.fullName;
    const parts = fullName.split(/\s+/).filter(Boolean);
    return parts
      .slice(0, INITIALS_MAX_CHARS)
      .map((value) => value.charAt(0).toUpperCase())
      .join('');
  });

  private readonly router = inject(Router);

  protected toggleMobileNav(): void {
    this.navOpen.update((value) => !value);
  }

  protected closeMobileNav(): void {
    this.navOpen.set(false);
  }

  protected logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
