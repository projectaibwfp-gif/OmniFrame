import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  afterNextRender,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  protected readonly authService = inject(AuthService);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly googleButton = viewChild.required<ElementRef<HTMLElement>>('googleButton');

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        void this.router.navigateByUrl('/');
      }
    });

    afterNextRender(() => {
      void this.syncSessionAndInitializeGoogleLogin();
    });
  }

  private async syncSessionAndInitializeGoogleLogin(): Promise<void> {
    await this.authService.restoreSession();
    await this.initializeGoogleLogin();
  }

  private async initializeGoogleLogin(): Promise<void> {
    await this.captureReferralIfPresent();
    await this.renderGoogleButton();
  }

  private async captureReferralIfPresent(): Promise<void> {
    const referralCode = this.route.snapshot.queryParamMap.get('ref');
    if (!referralCode) {
      return;
    }

    try {
      await this.authService.captureReferral(referralCode);
    } catch (error) {
      console.warn('Could not capture referral code', error);
    }
  }

  private async renderGoogleButton(): Promise<void> {
    try {
      await this.authService.renderGoogleButton(this.googleButton().nativeElement);
    } catch (error) {
      console.error('Could not render Google login button', error);
      this.authService.markLoginUnavailable();
    }
  }
}
