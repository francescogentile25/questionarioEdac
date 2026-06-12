import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    // Pagina pubblica fullscreen (link inviato via mail): fuori dal layout con header/sidebar
    path: 'questionario',
    loadComponent: () => import('./features/questionario/questionario')
      .then(c => c.Questionario)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'questionario'
  },
  {
    path: '',
    loadChildren: () => import('./features/_layout/layout.routes')
      .then(r => r.layoutRoutes)
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'questionario'
  },
];
