import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent) }
    ]
  },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { 
        path: '', 
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
        title: 'Недавние файлы'
      },
      { 
        path: 'files', 
        loadComponent: () => import('./pages/files/files.component').then(m => m.FilesComponent),
        title: 'Все файлы'
      },
      { 
        path: 'file-management', 
        loadComponent: () => import('./pages/file-management/file-management.component').then(m => m.FileManagementComponent),
        title: 'Управление файлами'
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
        title: 'Настройки профиля'
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
