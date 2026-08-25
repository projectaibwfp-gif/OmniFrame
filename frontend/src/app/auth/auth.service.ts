import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type {
  ApiResponse,
  AuthCurrentUserResponseDto,
  AuthGoogleResponseDto,
  AuthGoogleUserDto,
  AuthStateDto,
  ReferralCaptureResponseDto,
} from '@shared/api-contract';
import { DEFAULT_GOOGLE_CLIENT_ID } from '@shared/runtime-config';
import { buildApiUrl } from '../config/api.config';
import { withSkippedAuthInterceptor } from './auth-http-context';
import { type AuthUser } from './auth-session';

type GoogleCredentialResponse = {
  credential?: string;
};

type AuthResponse = ApiResponse<AuthGoogleResponseDto>;
type CurrentUserResponse = ApiResponse<AuthCurrentUserResponseDto>;
type AuthStateResponse = ApiResponse<AuthStateDto>;
type CaptureReferralResponse = ApiResponse<ReferralCaptureResponseDto>;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          prompt: (callback?: (notification: GooglePromptMomentNotification) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme: 'outline' | 'filled_blue' | 'filled_black';
              size: 'large' | 'medium' | 'small';
              text: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number;
            },
          ) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

interface GooglePromptMomentNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
}

const GOOGLE_CLIENT_ID = (
  import.meta.env['VITE_GOOGLE_CLIENT_ID'] || DEFAULT_GOOGLE_CLIENT_ID
).trim();

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<AuthUser | null>(null);
  readonly loginError = signal<string | null>(null);

  private readonly http = inject(HttpClient);
  private initializePromise: Promise<void> | null = null;
  private refreshPromise: Promise<boolean> | null = null;
  private initialized = false;
  private loginState = '';
  private loginSubmissionInFlight = false;

  async restoreSession(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<CurrentUserResponse>(buildApiUrl('/auth/me')),
      );
      this.user.set(this.mapUser(response.data.user));
      this.loginError.set(null);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status !== 401) {
        console.warn('Could not restore auth session', error);
      }

      this.user.set(null);
    }
  }

  isAuthenticated(): boolean {
    return this.user() !== null;
  }

  async renderGoogleButton(container: HTMLElement): Promise<void> {
    this.loginError.set(null);
    this.loginSubmissionInFlight = false;
    this.loginState = await this.fetchLoginState();
    await this.initializeGoogleAuth();
    if (!window.google) {
      throw new Error('Google Identity Services are unavailable.');
    }

    container.innerHTML = '';
    window.google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'pill',
      width: 300,
    });
    window.google.accounts.id.prompt((notification: GooglePromptMomentNotification) => {
      if (notification.isNotDisplayed()) {
        this.setLoginIssue(notification.getNotDisplayedReason());
        return;
      }
      if (notification.isSkippedMoment()) {
        this.setLoginIssue(notification.getSkippedReason());
      }
    });
  }

  async captureReferral(referralCode: string): Promise<void> {
    await firstValueFrom(
      this.http.post<CaptureReferralResponse>(
        buildApiUrl('/referrals/capture'),
        {
          referralCode,
        },
        {
          context: withSkippedAuthInterceptor(),
        },
      ),
    );
  }

  logout(): void {
    this.user.set(null);
    void firstValueFrom(this.http.post(buildApiUrl('/auth/logout'), {})).catch(() => undefined);
    window.google?.accounts.id.disableAutoSelect();
  }

  handleSessionExpired(): void {
    this.user.set(null);
    window.google?.accounts.id.disableAutoSelect();
  }

  markLoginUnavailable(): void {
    this.loginError.set('Logowanie Google jest obecnie niedostępne. Spróbuj ponownie.');
  }

  async refreshSession(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.refreshSessionInternal();
    return this.refreshPromise;
  }

  private async initializeGoogleAuth(): Promise<void> {
    if (this.initialized && window.google) {
      return;
    }
    if (this.initializePromise) {
      return this.initializePromise;
    }

    this.initializePromise = this.initializeGoogleClient();

    return this.initializePromise;
  }

  private async initializeGoogleClient(): Promise<void> {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('VITE_GOOGLE_CLIENT_ID is not configured.');
    }

    await this.loadGoogleScript();
    if (!window.google) {
      throw new Error('Failed to load Google Identity Services.');
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: GoogleCredentialResponse): void => {
        void this.loginWithGoogleCredential(response);
      },
    });
    this.initialized = true;
  }

  private async fetchLoginState(): Promise<string> {
    const response = await firstValueFrom(
      this.http.get<AuthStateResponse>(buildApiUrl('/auth/state'), {
        context: withSkippedAuthInterceptor(),
      }),
    );
    return response.data.state;
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src="https://accounts.google.com/gsi/client"]',
      );
      if (existingScript) {
        existingScript.addEventListener('load', (): void => resolve(), { once: true });
        existingScript.addEventListener(
          'error',
          (): void => reject(new Error('Cannot load Google script.')),
          {
            once: true,
          },
        );
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = (): void => resolve();
      script.onerror = (): void => reject(new Error('Cannot load Google script.'));
      document.head.appendChild(script);
    });
  }

  private async loginWithGoogleCredential(response: GoogleCredentialResponse): Promise<void> {
    if (!response.credential) {
      this.loginError.set('Logowanie Google zostało anulowane.');
      return;
    }
    if (this.loginSubmissionInFlight || !this.loginState) {
      return;
    }

    this.loginSubmissionInFlight = true;

    try {
      const result = await firstValueFrom(
        this.http.post<AuthResponse>(buildApiUrl('/auth/google'), {
          credential: response.credential,
          state: this.loginState,
        }),
      );
      this.user.set(this.mapUser(result.data.user));
      this.loginError.set(null);
      this.loginState = '';
    } catch (error) {
      this.loginError.set('Nie udało się zalogować przez Google. Spróbuj ponownie.');
      console.error('Could not authenticate with Google', error);
    } finally {
      this.loginSubmissionInFlight = false;
    }
  }

  private async refreshSessionInternal(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post(buildApiUrl('/auth/refresh'), {}, { context: withSkippedAuthInterceptor() }),
      );
      const response = await firstValueFrom(
        this.http.get<AuthResponse>(buildApiUrl('/auth/me'), {
          context: withSkippedAuthInterceptor(),
        }),
      );
      this.user.set(this.mapUser(response.data.user));
      return true;
    } catch {
      this.user.set(null);
      return false;
    } finally {
      this.refreshPromise = null;
    }
  }

  private mapUser(user: AuthGoogleUserDto): AuthUser {
    const givenName = this.normalizeNamePart(user.givenName);
    const familyName = this.normalizeNamePart(user.familyName);

    return {
      givenName,
      familyName,
      fullName: this.resolveFullName(user, givenName, familyName),
      email: user.email,
      picture: user.picture,
      role: user.role,
      phone: user.phone,
      birthDate: user.birthDate,
      description: user.description,
      referralCode: user.referralCode,
      referredByCode: user.referredByCode,
      registeredAt: user.registeredAt || '',
      lastLoginAt: user.lastLoginAt || '',
      updatedAt: user.updatedAt || '',
    };
  }

  private normalizeNamePart(value: string | null | undefined): string {
    return value?.trim() || '';
  }

  private resolveFullName(user: AuthGoogleUserDto, givenName: string, familyName: string): string {
    const fullNameFromClaim = user.name?.trim() || '';
    if (fullNameFromClaim) {
      return fullNameFromClaim;
    }

    const fallbackName = `${givenName} ${familyName}`.trim();
    return fallbackName || 'Użytkownik Google';
  }

  private setLoginIssue(reason: string): void {
    if (reason.includes('cancel') || reason.includes('dismiss') || reason.includes('user')) {
      this.loginError.set('Logowanie Google zostało anulowane.');
      return;
    }
    if (!this.user()) {
      this.loginError.set('Logowanie Google jest obecnie niedostępne. Spróbuj ponownie.');
    }
  }
}
