import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  readonly currentUser = inject(AuthService).user;
  readonly initials = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return 'U';
    }
    const parts = user.fullName.split(/\s+/).filter(Boolean);
    return (
      parts
        .slice(0, 2)
        .map((value) => value.charAt(0).toUpperCase())
        .join('') || 'U'
    );
  });
}
