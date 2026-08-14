import { __decorate } from "tslib";
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
let AppComponent = class AppComponent {
    constructor() {
        this.authService = inject(AuthService);
        this.currentUser = this.authService.user;
        this.initials = computed(() => {
            const user = this.currentUser();
            if (!user) {
                return '';
            }
            const fullName = `${user.givenName} ${user.familyName}`.trim() || user.fullName;
            const parts = fullName.split(/\s+/).filter(Boolean);
            return parts
                .slice(0, 2)
                .map((value) => value.charAt(0).toUpperCase())
                .join('');
        });
        this.router = inject(Router);
    }
    logout() {
        this.authService.logout();
        void this.router.navigateByUrl('/login');
    }
};
AppComponent = __decorate([
    Component({
        selector: 'app-root',
        standalone: true,
        imports: [RouterLink, RouterLinkActive, RouterOutlet],
        templateUrl: './app.component.html',
        styleUrl: './app.component.scss',
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
], AppComponent);
export { AppComponent };
