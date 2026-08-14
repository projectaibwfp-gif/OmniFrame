import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
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

    await this.authService.renderGoogleButton(this.googleButton.nativeElement);
  }
}
