import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'FinanzApp · Finanzas compartidas',
    loadComponent: () => import('./features/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'login',
    title: 'Iniciar sesión · FinanzApp',
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    title: 'Crear cuenta · FinanzApp',
    loadComponent: () => import('./features/auth/registro').then((m) => m.Registro),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'carteras' },
      { path: 'inicio', redirectTo: 'carteras' },
      { path: 'colaboraciones', redirectTo: 'carteras' },
      {
        path: 'carteras',
        title: 'Carteras · FinanzApp',
        loadComponent: () => import('./features/carteras/lista').then((m) => m.ListaCarteras),
      },
      {
        path: 'carteras/:id',
        title: 'Detalle de cartera · FinanzApp',
        loadComponent: () => import('./features/carteras/detalle').then((m) => m.DetalleCartera),
      },
      {
        path: 'contribuyentes',
        title: 'Contribuyentes · FinanzApp',
        loadComponent: () =>
          import('./features/contribuyentes/contribuyentes').then((m) => m.Contribuyentes),
      },
      {
        path: 'transacciones',
        title: 'Transacciones · FinanzApp',
        loadComponent: () =>
          import('./features/transacciones/transacciones').then((m) => m.Transacciones),
      },
      {
        path: 'inactivas',
        title: 'Carteras inactivas · FinanzApp',
        loadComponent: () => import('./features/inactivas/inactivas').then((m) => m.Inactivas),
      },
      {
        path: 'ajustes',
        title: 'Ajustes · FinanzApp',
        loadComponent: () => import('./features/ajustes/ajustes').then((m) => m.Ajustes),
      },
    ],
  },
  {
    path: '**',
    title: 'Página no encontrada · FinanzApp',
    loadComponent: () => import('./features/no-encontrado').then((m) => m.NoEncontrado),
  },
];
