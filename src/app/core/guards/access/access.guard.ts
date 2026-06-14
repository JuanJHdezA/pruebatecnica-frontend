import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { inject } from '@angular/core';
import { from, map } from 'rxjs';

export const accessGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Obtener el ID de la ruta (asumiendo que en el routing es path: 'proyecto/:id')
  const code = route.data['code'] || '';

  // console.log(code);

  return from(auth.accesosPermisos()).pipe(
    map((accesos: string[]) => {
      //Se valida que el codigo ingresado por ruta sea un código configurado al usuario en sesión
      // console.log(accesos.includes(code));

      // if (!accesos.includes(code)) router.navigateByUrl('control/acceso-denegado');

      return true;
    })
  );
};
