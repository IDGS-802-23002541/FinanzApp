import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.autenticado()) return true;

  return router.createUrlTree(['/login'], { queryParams: { destino: estado.url } });
};
