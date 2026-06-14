/**
 * Parámetros para encriptar datos en el servicio CV.
 */
export interface EncryptServiceInterface {
  /** Llave de encriptación utilizada. */
  key: string;
  /** Vector de inicialización (IV) para el algoritmo. */
  iv: string;
  /** Datos en texto plano que se desean encriptar. */
  data: string;
}

/**
 * Parámetros para desencriptar datos en el servicio CV.
 */
export interface DecryptServiceInterface {
  /** Llave de encriptación utilizada. */
  key: string;
  /** Vector de inicialización (IV) para el algoritmo. */
  iv: string;
  /** Texto cifrado que se desea desencriptar. */
  cipher: string;
}

/**
 * Respuesta estándar de procesos de encriptación/desencriptación.
 */
export interface encryptResponseInterface {
  /** Indica si ocurrió un error en la operación. */
  success: boolean;
  /** Mensaje descriptivo del resultado. */
  message: string;
  /** Texto cifrado generado o recibido. */
  cipher?: string;
  /** Datos desencriptados o información adicional. */
  data?: any;
}
