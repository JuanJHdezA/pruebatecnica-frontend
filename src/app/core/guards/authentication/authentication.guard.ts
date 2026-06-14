import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { inject } from '@angular/core';
import { from, map } from 'rxjs';

export const authenticationGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return from(auth.validarSesionActiva()).pipe(
    map((active) => {
      if (!active) {
        router.navigateByUrl('login');
      }

      return active;
    })
  );
};
