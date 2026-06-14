/**
 * Interface genérica para estandarizar las respuestas de un servicio o API.
 *
 * @template T - Tipo de dato que se espera en la propiedad `data`.
 */
export interface ResponseInterface<T> {
  /**
   * Indica si la operación fue exitosa.
   * - true: operación completada correctamente.
   * - false: ocurrió un error.
   */
  success?: boolean;

  /**
   * Código HTTP asociado a la respuesta.
   * Ejemplo: 200 (OK), 404 (Not Found), 500 (Internal Server Error).
   */
  httpCode?: number;

  /**
   * Código interno de error definido por la API o servicio.
   * Ejemplo: "USR_01" para error de usuario.
   */
  codeError?: string;

  /**
   * Mensaje descriptivo de la respuesta.
   * Puede ser informativo en caso de éxito o un mensaje de error.
   */
  message?: string;

  /**
   * Objeto que contiene detalles adicionales sobre errores.
   * Solo presente si la operación falla.
   */
  errors?: {
    /**
     * Mensaje descriptivo del error.
     */
    message?: string;

    /**
     * Nombre o tipo del error.
     * Ejemplo: "ValidationError", "DatabaseError".
     */
    error?: string;

    /**
     * Código de estado asociado al error.
     * Ejemplo: 400 (Bad Request), 401 (Unauthorized).
     */
    statusCode?: number;
  };

  /**
   * Datos devueltos por la operación.
   * El tipo depende del genérico `T` definido al usar la interfaz.
   * Ejemplo: un objeto `User`, un arreglo de productos, etc.
   */
  data?: T;
}
