import 'zone.js';
import '@angular/compiler';
import './styles.scss';
import { APP_INITIALIZER } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/auth/auth.interceptor';
import { credentialsInterceptor } from './app/auth/credentials.interceptor';
import { AuthService } from './app/auth/auth.service';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([credentialsInterceptor, authInterceptor])),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory:
        (authService: AuthService): (() => Promise<void>) =>
        () =>
          authService.restoreSession(),
      deps: [AuthService],
    },
  ],
}).catch((error: unknown) => console.error(error));
