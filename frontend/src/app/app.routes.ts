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
    path: 'products',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./products/products-list/products-list.component').then(
        ({ ProductsListComponent }) => ProductsListComponent,
      ),
  },
  {
    path: 'products/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./products/products-create/products-create.component').then(
        ({ ProductsCreateComponent }) => ProductsCreateComponent,
      ),
  },
  {
    path: 'products/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./products/products-details/products-details.component').then(
        ({ ProductsDetailsComponent }) => ProductsDetailsComponent,
      ),
  },
  {
    path: 'products/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./products/products-edit/products-edit.component').then(
        ({ ProductsEditComponent }) => ProductsEditComponent,
      ),
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
