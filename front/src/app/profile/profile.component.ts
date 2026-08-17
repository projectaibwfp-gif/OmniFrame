import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
  readonly copyState = signal<'idle' | 'success' | 'error'>('idle');
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
  readonly referralLink = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return '';
    }

    const origin = globalThis.location?.origin ?? '';
    return `${origin}/login?ref=${user.referralCode}`;
  });

  async copyReferralLink(): Promise<void> {
    const link = this.referralLink();
    if (!link || !navigator.clipboard) {
      this.copyState.set('error');
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      this.copyState.set('success');
    } catch {
      this.copyState.set('error');
    }
  }
}
