import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly authService = inject(AuthService);
  readonly currentUser = this.authService.user;
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

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
