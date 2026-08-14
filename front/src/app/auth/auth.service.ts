import { Injectable, signal } from '@angular/core';

export type AuthUser = {
  givenName: string;
  familyName: string;
  fullName: string;
};

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleUserPayload = {
  given_name?: string;
  family_name?: string;
  name?: string;
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

const STORAGE_KEY = 'omniframe.auth.user';
const DEFAULT_GOOGLE_CLIENT_ID =
  '181921852616-kqff26dgukqpg5o46ulkik3ir2hcri4r.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID = (import.meta.env['VITE_GOOGLE_CLIENT_ID'] || DEFAULT_GOOGLE_CLIENT_ID).trim();

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<AuthUser | null>(this.readStoredUser());

  private initializePromise: Promise<void> | null = null;
  private initialized = false;

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
    localStorage.removeItem(STORAGE_KEY);
    this.user.set(null);
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
      callback: (response: GoogleCredentialResponse): void => this.handleGoogleCredential(response),
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

  private handleGoogleCredential(response: GoogleCredentialResponse): void {
    if (!response.credential) {
      return;
    }

    const payload = this.decodeJwtPayload(response.credential);
    const givenName = payload.given_name?.trim() || '';
    const familyName = payload.family_name?.trim() || '';
    const fullNameFromClaim = payload.name?.trim() || '';
    const fullName =
      fullNameFromClaim || `${givenName} ${familyName}`.trim() || 'Użytkownik Google';

    const user: AuthUser = {
      givenName,
      familyName,
      fullName,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.user.set(user);
  }

  private decodeJwtPayload(token: string): GoogleUserPayload {
    const jwtParts = token.split('.');
    if (jwtParts.length < 2) {
      throw new Error('Invalid Google credential format.');
    }

    const payloadSegment = jwtParts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (payloadSegment.length % 4)) % 4);
    const payload = atob(`${payloadSegment}${padding}`);
    return JSON.parse(payload) as GoogleUserPayload;
  }

  private readStoredUser(): AuthUser | null {
    const rawUser = localStorage.getItem(STORAGE_KEY);
    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
}
