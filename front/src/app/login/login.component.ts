import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('googleButton', { static: true }) private googleButton?: ElementRef<HTMLElement>;

  readonly authService = inject(AuthService);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        void this.router.navigateByUrl('/');
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.googleButton) {
      return;
    }

    const referralCode = this.route.snapshot.queryParamMap.get('ref');
    if (referralCode) {
      try {
        await this.authService.captureReferral(referralCode);
      } catch (error) {
        console.warn('Could not capture referral code', error);
      }
    }

    try {
      await this.authService.renderGoogleButton(this.googleButton.nativeElement);
    } catch (error) {
      console.error('Could not render Google login button', error);
      this.authService.markLoginUnavailable();
    }
  }
}
