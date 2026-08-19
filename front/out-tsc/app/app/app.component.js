import { __decorate } from "tslib";
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
let AppComponent = class AppComponent {
    constructor() {
        this.authService = inject(AuthService);
        this.currentUser = this.authService.user;
        this.navOpen = signal(false);
        this.navItems = [
            { path: '/', label: 'Dashboard', icon: '▦', exact: true },
            { path: '/products', label: 'Produkty', icon: '▤', exact: false },
            { path: '/users', label: 'Użytkownicy', icon: '👤', exact: false },
            { path: '/profile', label: 'Profil', icon: '◌', exact: false },
            { path: '/about', label: 'O projekcie', icon: 'ⓘ', exact: false },
        ];
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
    toggleMobileNav() {
        this.navOpen.update((value) => !value);
    }
    closeMobileNav() {
        this.navOpen.set(false);
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
