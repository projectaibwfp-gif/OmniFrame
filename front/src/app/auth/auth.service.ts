import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { buildApiUrl } from '../config/api.config';
import { type AuthUser, type AuthRole } from './auth-session';

type GoogleCredentialResponse = {
  credential?: string;
};

type AuthResponseUser = {
  given_name: string | null;
  family_name: string | null;
  name: string | null;
  role: AuthRole;
};

type AuthResponse = {
  data: {
    user: AuthResponseUser;
  };
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
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

const DEFAULT_GOOGLE_CLIENT_ID =
  '181921852616-kqff26dgukqpg5o46ulkik3ir2hcri4r.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID = (import.meta.env['VITE_GOOGLE_CLIENT_ID'] || DEFAULT_GOOGLE_CLIENT_ID).trim();

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<AuthUser | null>(null);

  private readonly http = inject(HttpClient);
  private initializePromise: Promise<void> | null = null;
  private initialized = false;

  async restoreSession(): Promise<void> {
    try {
      const response = await firstValueFrom(this.http.get<AuthResponse>(buildApiUrl('/auth/me')));
      this.user.set(this.mapUser(response.data.user));
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
  }

  logout(): void {
    this.user.set(null);
    void firstValueFrom(this.http.post(buildApiUrl('/auth/logout'), {})).catch(() => undefined);
    window.google?.accounts.id.disableAutoSelect();
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
      return;
    }

    try {
      const result = await firstValueFrom(
        this.http.post<AuthResponse>(buildApiUrl('/auth/google'), {
          credential: response.credential,
        }),
      );
      this.user.set(this.mapUser(result.data.user));
    } catch (error) {
      console.error('Could not authenticate with Google', error);
    }
  }

  private mapUser(user: AuthResponseUser): AuthUser {
    const givenName = user.given_name?.trim() || '';
    const familyName = user.family_name?.trim() || '';
    const fullNameFromClaim = user.name?.trim() || '';
    const fullName =
      fullNameFromClaim || `${givenName} ${familyName}`.trim() || 'Użytkownik Google';

    return {
      givenName,
      familyName,
      fullName,
      role: user.role,
    };
  }
}
