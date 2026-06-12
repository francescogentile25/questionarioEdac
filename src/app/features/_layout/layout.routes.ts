import { Routes } from "@angular/router";
import { loginGuard } from "../../core/guards/login.guard";

export const layoutRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./main/main')
      .then(c => c.Main),
    children: [
      {
        path: 'login',
        canActivate: [loginGuard],
        loadComponent: () => import('./../auth/login/login')
          .then(c => c.Login)
      },
      // TODO: DA ELIMINARE
      // ROUTES ESEMPI D'USO
      {
        path: '__implementazione_tabella_semplice__',
        loadComponent: () => import('./../../__esempi_di_uso__/__implementazione_tabella_semplice__/tabella-semplice/tabella-semplice')
          .then(c => c.TabellaSemplice)
      },
      {
        path: '__implementazione_tabella_con_paginazione__',
        loadComponent: () => import('./../../__esempi_di_uso__/__implementazione_tabella_con_paginazione__/tabella-con-paginazione/tabella-con-paginazione')
          .then(c => c.TabellaConPaginazione)
      }
    ]
  },
  // Niente wildcard qui: gli URL sconosciuti devono ricadere sul '**' globale (app.routes.ts)
]
