import { __decorate, __metadata } from "tslib";
import { ChangeDetectionStrategy, Component, ViewChild, effect, inject, } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
let LoginComponent = class LoginComponent {
    constructor() {
        this.authService = inject(AuthService);
        this.route = inject(ActivatedRoute);
        this.router = inject(Router);
        effect(() => {
            if (this.authService.isAuthenticated()) {
                void this.router.navigateByUrl('/');
            }
        });
    }
    async ngAfterViewInit() {
        if (!this.googleButton) {
            return;
        }
        const referralCode = this.route.snapshot.queryParamMap.get('ref');
        if (referralCode) {
            try {
                await this.authService.captureReferral(referralCode);
            }
            catch (error) {
                console.warn('Could not capture referral code', error);
            }
        }
        try {
            await this.authService.renderGoogleButton(this.googleButton.nativeElement);
        }
        catch (error) {
            console.error('Could not render Google login button', error);
            this.authService.markLoginUnavailable();
        }
    }
};
__decorate([
    ViewChild('googleButton', { static: true }),
    __metadata("design:type", Function)
], LoginComponent.prototype, "googleButton", void 0);
LoginComponent = __decorate([
    Component({
        selector: 'app-login',
        standalone: true,
        templateUrl: './login.component.html',
        styleUrl: './login.component.scss',
        changeDetection: ChangeDetectionStrategy.OnPush,
    }),
    __metadata("design:paramtypes", [])
], LoginComponent);
export { LoginComponent };
