import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'chat',
        pathMatch: 'full'
      },
      {
        path: 'chat',
        loadComponent: () => import('./chat/chat-index.component').then(m => m.ChatIndexComponent)
      },
      {
        path: 'chat/:id',
        loadComponent: () => import('./chat/chat-room.component').then(m => m.ChatRoomComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
          { path: 'users', loadComponent: () => import('./users/user-management.component').then(m => m.UserManagementComponent) },
          { path: 'channels', loadComponent: () => import('./channels/channels').then(m => m.Channels) },
          { path: 'teams', loadComponent: () => import('./teams/teams').then(m => m.TeamsComponent) },
        ]
      },
      {
        path: 'dashboard',
        redirectTo: 'settings/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'users',
        redirectTo: 'settings/users',
        pathMatch: 'full'
      },
      {
        path: 'channels',
        redirectTo: 'settings/channels',
        pathMatch: 'full'
      },
      {
        path: 'teams',
        redirectTo: 'settings/teams',
        pathMatch: 'full'
      },
      {
        path: '**',
        loadComponent: () => import('./blank/blank.component').then(m => m.BlankPageComponent)
      }
    ]
  }
];
