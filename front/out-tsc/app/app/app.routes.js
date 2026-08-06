export const routes = [
    {
        path: '',
        loadComponent: () => import('./dashboard/dashboard.component').then(({ DashboardComponent }) => DashboardComponent),
    },
    {
        path: 'about',
        loadComponent: () => import('./about/about.component').then(({ AboutComponent }) => AboutComponent),
    },
    { path: '**', redirectTo: '' },
];
