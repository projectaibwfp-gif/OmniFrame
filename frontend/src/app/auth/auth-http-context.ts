import { HttpContext, HttpContextToken } from '@angular/common/http';

export const SKIP_AUTH_INTERCEPTOR = new HttpContextToken<boolean>(() => false);

export function withSkippedAuthInterceptor(): HttpContext {
  return new HttpContext().set(SKIP_AUTH_INTERCEPTOR, true);
}
