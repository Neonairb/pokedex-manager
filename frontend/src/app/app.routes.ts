import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import(
        './pages/auth/login/login'
      ).then((m) => m.Login),
  },

  {
    path: 'register',
    loadComponent: () =>
      import(
        './pages/auth/register/register'
      ).then((m) => m.Register),
  },

  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './pages/home/home'
      ).then((m) => m.Home),
  },

  {
    path: 'pokedex',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './pages/pokedex/pokedex'
      ).then((m) => m.Pokedex),
  },

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: 'home',
  },
];