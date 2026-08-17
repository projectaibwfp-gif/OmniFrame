import { __decorate } from "tslib";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { buildApiUrl } from '../config/api.config';
import { withSkippedAuthInterceptor } from './auth-http-context';
const DEFAULT_GOOGLE_CLIENT_ID = '181921852616-kqff26dgukqpg5o46ulkik3ir2hcri4r.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID = (import.meta.env['VITE_GOOGLE_CLIENT_ID'] || DEFAULT_GOOGLE_CLIENT_ID).trim();
let AuthService = class AuthService {
    constructor() {
        this.user = signal(null);
        this.loginError = signal(null);
        this.http = inject(HttpClient);
        this.initializePromise = null;
        this.refreshPromise = null;
        this.initialized = false;
        this.loginState = '';
    }
    async restoreSession() {
        try {
            const response = await firstValueFrom(this.http.get(buildApiUrl('/auth/me')));
            this.user.set(this.mapUser(response.data.user));
            this.loginError.set(null);
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
        this.loginError.set(null);
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
        window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed()) {
                this.setLoginIssue(notification.getNotDisplayedReason());
                return;
            }
            if (notification.isSkippedMoment()) {
                this.setLoginIssue(notification.getSkippedReason());
            }
        });
    }
    async captureReferral(referralCode) {
        await firstValueFrom(this.http.post(buildApiUrl('/referrals/capture'), {
            referralCode,
        }, {
            context: withSkippedAuthInterceptor(),
        }));
    }
    logout() {
        this.user.set(null);
        void firstValueFrom(this.http.post(buildApiUrl('/auth/logout'), {})).catch(() => undefined);
        window.google?.accounts.id.disableAutoSelect();
    }
    handleSessionExpired() {
        this.user.set(null);
        window.google?.accounts.id.disableAutoSelect();
    }
    markLoginUnavailable() {
        this.loginError.set('Logowanie Google jest obecnie niedostępne. Spróbuj ponownie.');
    }
    async refreshSession() {
        if (this.refreshPromise) {
            return this.refreshPromise;
        }
        this.refreshPromise = this.refreshSessionInternal();
        return this.refreshPromise;
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
    async fetchLoginState() {
        const response = await firstValueFrom(this.http.get(buildApiUrl('/auth/state'), {
            context: withSkippedAuthInterceptor(),
        }));
        return response.data.state;
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
            this.loginError.set('Logowanie Google zostało anulowane.');
            return;
        }
        try {
            const result = await firstValueFrom(this.http.post(buildApiUrl('/auth/google'), {
                credential: response.credential,
                state: this.loginState,
            }));
            this.user.set(this.mapUser(result.data.user));
            this.loginError.set(null);
        }
        catch (error) {
            this.loginError.set('Nie udało się zalogować przez Google. Spróbuj ponownie.');
            console.error('Could not authenticate with Google', error);
        }
    }
    async refreshSessionInternal() {
        try {
            await firstValueFrom(this.http.post(buildApiUrl('/auth/refresh'), {}, { context: withSkippedAuthInterceptor() }));
            const response = await firstValueFrom(this.http.get(buildApiUrl('/auth/me'), { context: withSkippedAuthInterceptor() }));
            this.user.set(this.mapUser(response.data.user));
            return true;
        }
        catch {
            this.user.set(null);
            return false;
        }
        finally {
            this.refreshPromise = null;
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
            email: user.email,
            picture: user.picture,
            role: user.role,
            referralCode: user.referralCode,
            referredByCode: user.referredByCode,
        };
    }
    setLoginIssue(reason) {
        if (reason.includes('cancel') || reason.includes('dismiss') || reason.includes('user')) {
            this.loginError.set('Logowanie Google zostało anulowane.');
            return;
        }
        if (!this.user()) {
            this.loginError.set('Logowanie Google jest obecnie niedostępne. Spróbuj ponownie.');
        }
    }
};
AuthService = __decorate([
    Injectable({ providedIn: 'root' })
], AuthService);
export { AuthService };
