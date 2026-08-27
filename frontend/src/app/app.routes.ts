import type { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./login/login.component').then(({ LoginComponent }) => LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        ({ DashboardComponent }) => DashboardComponent,
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./profile/profile.component').then(({ ProfileComponent }) => ProfileComponent),
  },
  {
    path: 'about',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./about/about.component').then(({ AboutComponent }) => AboutComponent),
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./users/users.component').then(({ UsersComponent }) => UsersComponent),
  },
  {
    path: 'news',
    canActivate: [authGuard],
    loadComponent: () => import('./news/news.component').then(({ NewsComponent }) => NewsComponent),
  },
  {
    path: 'boosted',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./boostable-bosses/boostable-bosses.component').then(
        ({ BoostableBossesComponent }) => BoostableBossesComponent,
      ),
  },
  {
    path: 'boostable-bosses',
    redirectTo: 'boosted',
    pathMatch: 'full',
  },
  {
    path: 'character',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tibia-character/tibia-character.component').then(
        ({ TibiaCharacterComponent }) => TibiaCharacterComponent,
      ),
  },
  {
    path: 'highscores-snapshots',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./highscores-snapshots/highscores-snapshots.component').then(
        ({ HighscoresSnapshotsComponent }) => HighscoresSnapshotsComponent,
      ),
  },
  {
    path: 'killstatistics',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tibia-killstatistics/tibia-killstatistics.component').then(
        ({ TibiaKillStatisticsComponent }) => TibiaKillStatisticsComponent,
      ),
  },
  {
    path: 'hunting-places',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./hunting-places/hunting-places.component').then(
        ({ HuntingPlacesComponent }) => HuntingPlacesComponent,
      ),
  },
  {
    path: 'hunting-places/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./hunting-places/hunting-places-detail.component').then(
        ({ HuntingPlacesDetailComponent }) => HuntingPlacesDetailComponent,
      ),
  },
  {
    path: 'charm-places',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./charm-places/charm-places.component').then(
        ({ CharmPlacesComponent }) => CharmPlacesComponent,
      ),
  },
  {
    path: 'charm-places/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./charm-places/charm-places-detail.component').then(
        ({ CharmPlacesDetailComponent }) => CharmPlacesDetailComponent,
      ),
  },
  {
    path: 'quests',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./quests/quests.component').then(({ QuestsComponent }) => QuestsComponent),
  },
  {
    path: 'quests/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./quests/quest-detail.component').then(
        ({ QuestDetailComponent }) => QuestDetailComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
