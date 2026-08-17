import { __decorate } from "tslib";
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
let ProfileComponent = class ProfileComponent {
    constructor() {
        this.currentUser = inject(AuthService).user;
        this.copyState = signal('idle');
        this.initials = computed(() => {
            const user = this.currentUser();
            if (!user) {
                return 'U';
            }
            const parts = user.fullName.split(/\s+/).filter(Boolean);
            return (parts
                .slice(0, 2)
                .map((value) => value.charAt(0).toUpperCase())
                .join('') || 'U');
        });
        this.referralLink = computed(() => {
            const user = this.currentUser();
            if (!user) {
                return '';
            }
            const origin = globalThis.location?.origin ?? '';
            return `${origin}/login?ref=${user.referralCode}`;
        });
    }
    async copyReferralLink() {
        const link = this.referralLink();
        if (!link || !navigator.clipboard) {
            this.copyState.set('error');
            return;
        }
        try {
            await navigator.clipboard.writeText(link);
            this.copyState.set('success');
        }
        catch {
            this.copyState.set('error');
        }
    }
};
ProfileComponent = __decorate([
    Component({
        selector: 'app-profile',
        standalone: true,
        templateUrl: './profile.component.html',
        styleUrl: './profile.component.scss',
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
], ProfileComponent);
export { ProfileComponent };
