import { authGuard, guestGuard } from './auth/auth.guards';
export const routes = [
    {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./login/login.component').then(({ LoginComponent }) => LoginComponent),
    },
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () => import('./dashboard/dashboard.component').then(({ DashboardComponent }) => DashboardComponent),
    },
    {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./profile/profile.component').then(({ ProfileComponent }) => ProfileComponent),
    },
    {
        path: 'about',
        canActivate: [authGuard],
        loadComponent: () => import('./about/about.component').then(({ AboutComponent }) => AboutComponent),
    },
    {
        path: 'products',
        canActivate: [authGuard],
        loadComponent: () => import('./products/products.component').then(({ ProductsComponent }) => ProductsComponent),
    },
    {
        path: 'users',
        canActivate: [authGuard],
        loadComponent: () => import('./users/users.component').then(({ UsersComponent }) => UsersComponent),
    },
    { path: '**', redirectTo: '' },
];
