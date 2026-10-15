import 'zone.js';
import '@angular/compiler';
import '@angular/localize';
import './styles.scss';
import { inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/auth/auth.interceptor';
import { credentialsInterceptor } from './app/auth/credentials.interceptor';
import { httpErrorInterceptor } from './app/core/http-error.interceptor';
import { AuthService } from './app/auth/auth.service';
import { SeoService } from './app/core/seo.service';
import { ThemeService } from './app/services/theme.service';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([credentialsInterceptor, authInterceptor, httpErrorInterceptor]),
    ),
    // ThemeService applies the stored theme in its constructor, so it must be
    // instantiated eagerly before the first render to avoid a theme flash.
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
    provideAppInitializer(() => {
      inject(SeoService).initialize();
    }),
    provideAppInitializer(() => inject(AuthService).restoreSession()),
  ],
}).catch((error: unknown) => console.error(error));
