import { __decorate } from "tslib";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { buildApiUrl } from '../config/api.config';
const DEFAULT_GOOGLE_CLIENT_ID = '181921852616-kqff26dgukqpg5o46ulkik3ir2hcri4r.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID = (import.meta.env['VITE_GOOGLE_CLIENT_ID'] || DEFAULT_GOOGLE_CLIENT_ID).trim();
let AuthService = class AuthService {
    constructor() {
        this.user = signal(null);
        this.http = inject(HttpClient);
        this.initializePromise = null;
        this.initialized = false;
    }
    async restoreSession() {
        try {
            const response = await firstValueFrom(this.http.get(buildApiUrl('/auth/me')));
            this.user.set(this.mapUser(response.data.user));
        }
        catch (error) {
            if (error instanceof HttpErrorResponse && error.status !== 401) {
                console.warn('Could not restore auth session', error);
            }
            this.user.set(null);
        }
    }
    isAuthenticated() {
        return this.user() !== null;
    }
    async renderGoogleButton(container) {
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
    logout() {
        this.user.set(null);
        void firstValueFrom(this.http.post(buildApiUrl('/auth/logout'), {})).catch(() => undefined);
        window.google?.accounts.id.disableAutoSelect();
    }
    async initializeGoogleAuth() {
        if (this.initialized && window.google) {
            return;
        }
        if (this.initializePromise) {
            return this.initializePromise;
        }
        this.initializePromise = this.initializeGoogleClient();
        return this.initializePromise;
    }
    async initializeGoogleClient() {
        if (!GOOGLE_CLIENT_ID) {
            throw new Error('VITE_GOOGLE_CLIENT_ID is not configured.');
        }
        await this.loadGoogleScript();
        if (!window.google) {
            throw new Error('Failed to load Google Identity Services.');
        }
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => {
                void this.loginWithGoogleCredential(response);
            },
        });
        this.initialized = true;
    }
    loadGoogleScript() {
        return new Promise((resolve, reject) => {
            if (window.google) {
                resolve();
                return;
            }
            const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (existingScript) {
                existingScript.addEventListener('load', () => resolve(), { once: true });
                existingScript.addEventListener('error', () => reject(new Error('Cannot load Google script.')), {
                    once: true,
                });
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Cannot load Google script.'));
            document.head.appendChild(script);
        });
    }
    async loginWithGoogleCredential(response) {
        if (!response.credential) {
            return;
        }
        try {
            const result = await firstValueFrom(this.http.post(buildApiUrl('/auth/google'), {
                credential: response.credential,
            }));
            this.user.set(this.mapUser(result.data.user));
        }
        catch (error) {
            console.error('Could not authenticate with Google', error);
        }
    }
    mapUser(user) {
        const givenName = user.given_name?.trim() || '';
        const familyName = user.family_name?.trim() || '';
        const fullNameFromClaim = user.name?.trim() || '';
        const fullName = fullNameFromClaim || `${givenName} ${familyName}`.trim() || 'Użytkownik Google';
        return {
            givenName,
            familyName,
            fullName,
            role: user.role,
        };
    }
};
AuthService = __decorate([
    Injectable({ providedIn: 'root' })
], AuthService);
export { AuthService };
