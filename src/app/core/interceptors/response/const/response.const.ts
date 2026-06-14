/**
 * Constante que define respuestas estándar de error para el consumo de APIs.
 *
 * Se utiliza en interceptores o manejadores de errores para devolver
 * un objeto uniforme al frontend cuando ocurre un fallo inesperado
 * o cuando no es posible descifrar datos.
 */
export const ErroRHandlerRespSPCONST = {
  /**
   * Respuesta genérica para errores inesperados o no registrados.
   * Representa un fallo interno del servidor.
   */
  ERROR_RESPONSE: {
    success: false, // Indica que la operación no fue exitosa
    status: 'InternalServerError', // Estado semántico del error
    httpCode: 409, // Código HTTP asociado (Conflict)
    codeError: '99', // Código interno de error
    message: 'Se ha producido un error inesperado o no registrado en el sistema', // Mensaje descriptivo
    data: null // No se devuelve información adicional
  },

  /**
   * Respuesta específica para errores de descifrado de datos.
   * Se utiliza cuando la API no puede procesar correctamente
   * la información encriptada recibida.
   */
  ERROR_DECIPHER: {
    success: false, // Indica que la operación no fue exitosa
    status: 'failedDependency', // Estado semántico del error
    httpCode: 424, // Código HTTP asociado (Failed Dependency)
    codeError: '12', // Código interno de error
    message: 'No fue posible descifrar los datos recibidos.', // Mensaje descriptivo
    data: null // No se devuelve información adicional
  }
};
