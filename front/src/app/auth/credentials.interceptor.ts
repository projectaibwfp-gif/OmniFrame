import type { HttpInterceptorFn } from '@angular/common/http';

// The Angular app calls the backend on a different origin (apiomniframe.vercel.app),
// so every request must send cookies cross-origin. This runs before the auth
// interceptor so credentialed cookies are attached to all requests, including
// /auth/state, /auth/google and /auth/refresh which skip the 401-retry logic.
export const credentialsInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.withCredentials) {
    return next(request);
  }

  return next(request.clone({ withCredentials: true }));
};
