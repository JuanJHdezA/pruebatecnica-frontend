export interface UserLoginInterface {
  /**
   * Nombre de usuario o identificador único para el acceso.
   * Este campo es obligatorio y se utiliza para autenticar al usuario.
   */
  usuario: string;

  /**
   * Contraseña asociada al usuario.
   * Se utiliza junto con el nombre de usuario para validar la autenticación.
   */
  password: string;
}

/**
 * Estructura de la respuesta de autenticación que devuelve el sistema
 * tras validar las credenciales de acceso.
 */
export interface AuthUser {
  /** Código de estado interno de la operación de autenticación. */
  code: 'USUARIO_NOVALIDO' | 'LOGIN_SUCCESS';
  mesage: string;
  user: {
    usuario: string;
    details: {
      personales: {
        nombre: string;
        apellidosPaternos: string;
        apellidosMaternos: string;
        fullname: string;
        email: string;
      };
      imgperfil: null;
    };
    session: {
      token: string;
      credential: {
        password: string;
        keys: { key: string; iv: string };
      };
    };
    accesos: [];
  };
}
