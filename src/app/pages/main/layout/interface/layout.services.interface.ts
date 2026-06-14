/**
 * Define la estructura de datos persistente para el usuario en IndexedDB.
 * * Esta interfaz centraliza la información de perfil, estado de sesión
 * y permisos necesarios para la autenticación y personalización en el cliente.
 */
export interface DataUserInterface {
  /** Identificador único o nombre de cuenta del usuario. */
  usuario?: string;

  /** Información descriptiva y de perfil del usuario. */
  details?: {
    /** Datos biográficos y de contacto. */
    personales?: {
      nombre?: string;
      apellidosPaternos?: string;
      apellidosMaternos?: string;
      /** Nombre completo formateado para visualización rápida. */
      fullname?: string;
      email?: string;
    };
    /** Representación en base64 o URL de la imagen de perfil; null si no tiene. */
    imgperfil?: string | null;
  };

  /** Datos críticos de autenticación y seguridad para persistencia. */
  session?: {
    /** Token de autorización (ej. JWT) para llamadas a la API. */
    token?: string;
    /** Credenciales necesarias para procesos de cifrado/descifrado local. */
    credential?: {
      /** Hash de la contraseña del usuario. */
      password?: string;
      /** Parámetros de cifrado simétrico para proteger datos en local. */
      keys?: {
        /** Clave secreta para cifrado AES. */
        key?: string;
        /** Vector de inicialización para el algoritmo de cifrado. */
        iv?: string;
      };
    };
  };

  /** Lista de roles o permisos asignados al usuario (ej?: ["admin", "editor"]). */
  accesos?: string[];
}
