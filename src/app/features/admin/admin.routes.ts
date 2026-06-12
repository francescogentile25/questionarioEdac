import { Routes } from '@angular/router';
import { supabaseAuthGuard, supabaseLoginGuard } from '../../core/guards/supabase-auth.guard';

// Lazy: i guard importano supabase-js — tenerli qui evita di caricarlo nel bundle iniziale
export const adminRoutes: Routes = [
  {
    path: 'login',
    canActivate: [supabaseLoginGuard],
    loadComponent: () => import('./login/admin-login').then((c) => c.AdminLogin),
  },
  {
    path: '',
    canActivate: [supabaseAuthGuard],
    loadComponent: () => import('./dashboard/dashboard').then((c) => c.Dashboard),
  },
];
