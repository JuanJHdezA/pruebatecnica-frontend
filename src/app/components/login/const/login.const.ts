/**
 * Conjunto de mensajes de validación y error estandarizados
 * utilizados en procesos de autenticación y control de accesos.
 */
export const loginValidationConst: any = {
  /**
   * Mensaje mostrado cuando la cuenta de usuario especificada
   * no existe en los registros del sistema.
   * Se recomienda verificar la exactitud del identificador ingresado.
   */
  USUARIO_NOVALIDO: 'Credenciales no validas.',

  /**
   * Mensaje mostrado cuando la contraseña proporcionada
   * no corresponde al usuario especificado.
   * Indica un fallo en el proceso de autenticación.
   */
  PASSWORD_NOVALIDO: 'Credenciales no validas.',

  /**
   * Mensaje mostrado cuando la cuenta de usuario se encuentra
   * marcada como inactiva o no vigente en el sistema.
   */
  INACTIVO: 'Usuario NO vigente',

  /**
   * Mensaje de advertencia cuando los roles o permisos asignados
   * al usuario han caducado y ya no son válidos.
   */
  ROLES_VENCIDOS: 'Permisos asignados a su usuario han caducado.',

  /**
   * Mensaje de advertencia cuando el usuario no tiene roles
   * o permisos asignados en el sistema.
   * Se sugiere notificar al administrador correspondiente.
   */
  ROLES_SIN_ASIGNAR: 'ADVERTENCIA: Usuario sin accesos y/o permisos asignados',

  /**
   * Mensaje de advertencia cuando el usuario no tiene servicios
   * habilitados o asignados en el sistema.
   * Se sugiere notificar al administrador correspondiente.
   */
  SERVICIOS_SIN_ASIGNAR: 'ADVERTENCIA: Usuario sin accesos y/o permisos asignados.',

  /**
   * Mensaje genérico para errores no identificados o desconocidos.
   * Puede ser utilizado como fallback en validaciones.
   */
  ERROR_DESCONOCIDO: '',

  /**
   * Mensaje mostrado cuando la vigencia de la cuenta de usuario
   * ha expirado. Se recomienda notificar al administrador.
   */
  VIGENCIA: 'La vigencia del usuario ha caducado',

  /**
   * Mensaje mostrado cuando el número máximo de intentos de acceso
   * ha sido superado. Se informa que se han emitido contraseñas
   * temporales al correo electrónico registrado del usuario.
   */
  NUM_INTENTOS: 'Número de intentos superados'
};
