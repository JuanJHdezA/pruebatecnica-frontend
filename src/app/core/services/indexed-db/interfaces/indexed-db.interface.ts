export interface IndexedDb {
  /**
   * Información del usuario almacenado en IndexedDB.
   * - key: Identificador único de la sesión o usuario.
   * - user: Datos completos del usuario en formato userIndxedDBInterface.
   */
  users: {
    key: string;
    user: UserIndexedDBInterface;
  };

  /**
   * Lista de permisos asociados al usuario.
   * Cada permiso se representa como un string.
   */
  permissions: string[];
}

/**
 * Representa las llaves de encriptación utilizadas en la sesión.
 */
export interface keysDBInterface {
  /**
   * Llave de encriptación (opcional).
   * Puede ser generada dinámicamente o provenir de configuración.
   */
  key?: string;

  /**
   * Vector de inicialización (IV) para el cifrado (opcional).
   * Se utiliza junto con la llave para asegurar la encriptación.
   */
  iv?: string;
}

/**
 * Representa la respuesta de una operación relacionada con la sesión en IndexedDB.
 */
export interface dataSessionIDBInterface {
  /**
   * Indica si la operación fue exitosa.
   */
  success: boolean;

  /**
   * Mensaje descriptivo del resultado de la operación.
   */
  message: string;

  /**
   * Información de la sesión del usuario almacenada en IndexedDB.
   * Este campo es opcional y solo estará presente si la operación fue exitosa.
   */
  data?: UserIndexedDBInterface | null;
}

/**
 * Define la estructura de datos persistente para el usuario en IndexedDB.
 * * Esta interfaz centraliza la información de perfil, estado de sesión
 * y permisos necesarios para la autenticación y personalización en el cliente.
 */
export interface UserIndexedDBInterface {
  /** Identificador único o nombre de cuenta del usuario. */
  usuario: string;

  /** Información descriptiva y de perfil del usuario. */
  details: {
    /** Datos biográficos y de contacto. */
    personales: {
      nombre: string;
      apellidosPaternos: string;
      apellidosMaternos: string;
      /** Nombre completo formateado para visualización rápida. */
      fullname: string;
      email: string;
    };
    /** Representación en base64 o URL de la imagen de perfil; null si no tiene. */
    imgperfil: string | null;
  };

  /** Datos críticos de autenticación y seguridad para persistencia. */
  session: {
    /** Token de autorización (ej. JWT) para llamadas a la API. */
    token: string;
    /** Credenciales necesarias para procesos de cifrado/descifrado local. */
    credential: {
      /** Hash de la contraseña del usuario. */
      password: string;
      /** Parámetros de cifrado simétrico para proteger datos en local. */
      keys: {
        /** Clave secreta para cifrado AES. */
        key: string;
        /** Vector de inicialización para el algoritmo de cifrado. */
        iv: string;
      };
    };
  };

  /** Lista de roles o permisos asignados al usuario (ej: ["admin", "editor"]). */
  accesos: string[];
}
