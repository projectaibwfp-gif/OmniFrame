import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
export const authGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    return authService.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
export const guestGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    return authService.isAuthenticated() ? router.createUrlTree(['/']) : true;
};
