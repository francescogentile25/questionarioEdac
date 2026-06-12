import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { SupabaseService } from '../services/supabase.service';
import { globalPaths } from '../../features/_config/global-paths.config';

/** Protegge le rotte admin: senza sessione Supabase → login. */
export const supabaseAuthGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  return toObservable(supabase.ready).pipe(
    filter(Boolean),
    take(1),
    map(() =>
      supabase.isAuthenticated() ? true : router.createUrlTree([globalPaths.adminLoginUrl]),
    ),
  );
};

/** Inverso: utente già autenticato sulla pagina di login → dashboard. */
export const supabaseLoginGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  return toObservable(supabase.ready).pipe(
    filter(Boolean),
    take(1),
    map(() =>
      supabase.isAuthenticated() ? router.createUrlTree([globalPaths.adminUrl]) : true,
    ),
  );
};
