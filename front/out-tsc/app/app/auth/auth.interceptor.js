import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, switchMap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SKIP_AUTH_INTERCEPTOR } from './auth-http-context';
import { AuthService } from './auth.service';
function shouldSkipRequest(url) {
    return url.includes('/auth/refresh') || url.includes('/auth/google');
}
export const authInterceptor = (request, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (request.context.get(SKIP_AUTH_INTERCEPTOR) || shouldSkipRequest(request.url)) {
        return next(request);
    }
    return next(request).pipe(catchError((error) => {
        if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
            return throwError(() => error);
        }
        return from(authService.refreshSession()).pipe(switchMap((restored) => {
            if (restored) {
                return next(request);
            }
            authService.handleSessionExpired();
            void router.navigateByUrl('/login');
            return throwError(() => error);
        }), catchError((refreshError) => {
            authService.handleSessionExpired();
            void router.navigateByUrl('/login');
            return throwError(() => refreshError);
        }));
    }));
};
