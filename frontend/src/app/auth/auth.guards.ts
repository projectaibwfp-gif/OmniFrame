import { inject } from '@angular/core';
import {
  Router,
  type ActivatedRouteSnapshot,
  type CanActivateFn,
  type UrlTree,
} from '@angular/router';
import { AuthService } from './auth.service';

const NON_ADMIN_HOME_PATH = '/news';

function buildLoginRedirect(route: ActivatedRouteSnapshot, router: Router): UrlTree {
  return router.createUrlTree(['/login'], {
    queryParams: route.queryParams,
  });
}

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated() ? true : buildLoginRedirect(route, router);
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated() ? router.createUrlTree(['/']) : true;
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAdmin() ? true : router.createUrlTree([NON_ADMIN_HOME_PATH]);
};
