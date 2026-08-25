import 'zone.js';
import '@angular/compiler';
import '@angular/localize';
import './styles.scss';
import { APP_INITIALIZER } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/auth/auth.interceptor';
import { credentialsInterceptor } from './app/auth/credentials.interceptor';
import { AuthService } from './app/auth/auth.service';
import { ThemeService } from './app/services/theme.service';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([credentialsInterceptor, authInterceptor])),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory:
        (themeService: ThemeService): (() => void) =>
        () => {
          themeService.getTheme();
        },
      deps: [ThemeService],
    },
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
