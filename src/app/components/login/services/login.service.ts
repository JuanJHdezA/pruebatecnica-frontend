import { inject, Injectable } from '@angular/core';
import { ResponseInterface } from '../../../core/interfaces/response.interface';
import { AuthUser, UserLoginInterface } from '../interfaces/login.services.interface';
import { AuthService } from '../../../core/services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private authService = inject(AuthService);

  /**
   * Solicita acceso al sistema autenticando al usuario.
   *
   * @param usuario - Objeto con las credenciales de inicio de sesión (usuario, password, rememberme).
   * @returns Promesa con la respuesta del servidor en formato ResponseInterface<AuthUser>.
   *
   * Flujo:
   * 1. Recibe las credenciales del usuario.
   * 2. Llama al servicio de autenticación (`authService.logIn`) con las credenciales.
   * 4. Devuelve la respuesta del servidor.
   */
  public async solicitarAcceso(usuario: UserLoginInterface): Promise<ResponseInterface<AuthUser>> {
    return await this.authService.logIn(usuario);
  }
}
