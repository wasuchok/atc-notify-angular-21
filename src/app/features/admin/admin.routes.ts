import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./users/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'channels',
        loadComponent: () => import('./channels/channels').then(m => m.Channels)
      },
      {
        path: 'teams',
        loadComponent: () => import('./teams/teams').then(m => m.TeamsComponent)
      },
      {
        path: '**',
        loadComponent: () => import('./blank/blank.component').then(m => m.BlankPageComponent)
      }
    ]
  }
];
