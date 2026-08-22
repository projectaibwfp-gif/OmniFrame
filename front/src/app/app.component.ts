import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { LocalizationService, type Locale } from './services/localization.service';
import { LanguageSwitcherComponent } from './components/language-switcher.component';
import { ThemeSwitcherComponent } from './components/theme-switcher.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LanguageSwitcherComponent, ThemeSwitcherComponent],
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
      { path: '/boostable-bosses', label: translations.boostableBosses, icon: '⚔', exact: false },
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
    boostableBosses: string;
    users: string;
    profile: string;
    about: string;
  } {
    const translations = {
      en: {
        dashboard: 'Dashboard',
        products: 'Products',
        boostableBosses: 'Boostable bosses',
        users: 'Users',
        profile: 'Profile',
        about: 'About project',
      },
      pl: {
        dashboard: 'Pulpit',
        products: 'Produkty',
        boostableBosses: 'Boostable bossowie',
        users: 'Użytkownicy',
        profile: 'Profil',
        about: 'O projekcie',
      },
    };
    return translations[locale];
  }
}
