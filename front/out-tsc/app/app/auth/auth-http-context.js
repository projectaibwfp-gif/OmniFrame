import { HttpContext, HttpContextToken } from '@angular/common/http';
export const SKIP_AUTH_INTERCEPTOR = new HttpContextToken(() => false);
export function withSkippedAuthInterceptor() {
    return new HttpContext().set(SKIP_AUTH_INTERCEPTOR, true);
}
