import { __decorate } from "tslib";
import { Injectable, signal } from '@angular/core';
const STORAGE_KEY = 'omniframe.auth.user';
const DEFAULT_GOOGLE_CLIENT_ID = '181921852616-kqff26dgukqpg5o46ulkik3ir2hcri4r.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID = (import.meta.env['VITE_GOOGLE_CLIENT_ID'] || DEFAULT_GOOGLE_CLIENT_ID).trim();
let AuthService = class AuthService {
    constructor() {
        this.user = signal(this.readStoredUser());
        this.initializePromise = null;
        this.initialized = false;
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
        localStorage.removeItem(STORAGE_KEY);
        this.user.set(null);
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
            callback: (response) => this.handleGoogleCredential(response),
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
    handleGoogleCredential(response) {
        if (!response.credential) {
            return;
        }
        const payload = this.decodeJwtPayload(response.credential);
        const givenName = payload.given_name?.trim() || '';
        const familyName = payload.family_name?.trim() || '';
        const fullNameFromClaim = payload.name?.trim() || '';
        const fullName = fullNameFromClaim || `${givenName} ${familyName}`.trim() || 'Użytkownik Google';
        const user = {
            givenName,
            familyName,
            fullName,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.user.set(user);
    }
    decodeJwtPayload(token) {
        const jwtParts = token.split('.');
        if (jwtParts.length < 2) {
            throw new Error('Invalid Google credential format.');
        }
        const payloadSegment = jwtParts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padding = '='.repeat((4 - (payloadSegment.length % 4)) % 4);
        const payload = atob(`${payloadSegment}${padding}`);
        return JSON.parse(payload);
    }
    readStoredUser() {
        const rawUser = localStorage.getItem(STORAGE_KEY);
        if (!rawUser) {
            return null;
        }
        try {
            return JSON.parse(rawUser);
        }
        catch {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
    }
};
AuthService = __decorate([
    Injectable({ providedIn: 'root' })
], AuthService);
export { AuthService };
