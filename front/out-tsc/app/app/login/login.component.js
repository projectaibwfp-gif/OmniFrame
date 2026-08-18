import { __decorate, __metadata } from "tslib";
import { ChangeDetectionStrategy, Component, afterNextRender, effect, inject, viewChild, } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
let LoginComponent = class LoginComponent {
    constructor() {
        this.authService = inject(AuthService);
        this.route = inject(ActivatedRoute);
        this.router = inject(Router);
        this.googleButton = viewChild.required('googleButton');
        effect(() => {
            if (this.authService.isAuthenticated()) {
                void this.router.navigateByUrl('/');
            }
        });
        afterNextRender(() => {
            void this.initializeGoogleLogin();
        });
    }
    async initializeGoogleLogin() {
        await this.captureReferralIfPresent();
        await this.renderGoogleButton();
    }
    async captureReferralIfPresent() {
        const referralCode = this.route.snapshot.queryParamMap.get('ref');
        if (!referralCode) {
            return;
        }
        try {
            await this.authService.captureReferral(referralCode);
        }
        catch (error) {
            console.warn('Could not capture referral code', error);
        }
    }
    async renderGoogleButton() {
        try {
            await this.authService.renderGoogleButton(this.googleButton().nativeElement);
        }
        catch (error) {
            console.error('Could not render Google login button', error);
            this.authService.markLoginUnavailable();
        }
    }
};
LoginComponent = __decorate([
    Component({
        selector: 'app-login',
        templateUrl: './login.component.html',
        styleUrl: './login.component.scss',
        changeDetection: ChangeDetectionStrategy.OnPush,
    }),
    __metadata("design:paramtypes", [])
], LoginComponent);
export { LoginComponent };
