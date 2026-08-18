import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { MdbTooltipModule } from 'mdb-angular-ui-kit/tooltip';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MdbCollapseModule, MdbTooltipModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly authService = inject(AuthService);
  readonly currentUser = this.authService.user;
  readonly navOpen = signal(false);
  readonly appVersion = __APP_VERSION__;
  readonly navItems = [
    { path: '/', label: 'Dashboard', icon: '▦', exact: true },
    { path: '/products', label: 'Produkty', icon: '▤', exact: false },
    { path: '/users', label: 'Użytkownicy', icon: '👤', exact: false },
    { path: '/profile', label: 'Profil', icon: '◌', exact: false },
    { path: '/about', label: 'O projekcie', icon: 'ⓘ', exact: false },
  ] as const;
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
}
