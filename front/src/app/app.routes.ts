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
  { path: '**', redirectTo: '' },
];
