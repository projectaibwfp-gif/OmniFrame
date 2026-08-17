import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
function buildLoginRedirect(route, router) {
    return router.createUrlTree(['/login'], {
        queryParams: route.queryParams,
    });
}
export const authGuard = (route) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    return authService.isAuthenticated() ? true : buildLoginRedirect(route, router);
};
export const guestGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    return authService.isAuthenticated() ? router.createUrlTree(['/']) : true;
};
