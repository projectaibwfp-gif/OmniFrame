import 'zone.js';
import '@angular/compiler';
import './styles.scss';
import { APP_INITIALIZER } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { AuthService } from './app/auth/auth.service';
import { routes } from './app/app.routes';
bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(routes),
        provideHttpClient(),
        {
            provide: APP_INITIALIZER,
            multi: true,
            useFactory: (authService) => () => authService.restoreSession(),
            deps: [AuthService],
        },
    ],
}).catch((error) => console.error(error));
