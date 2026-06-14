import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IndexedDbService } from '../indexed-db/indexed-db.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { EncryptService } from '../encrypt/encrypt.service';
import { firstValueFrom } from 'rxjs';
import { ResponseInterface } from '../../interfaces/response.interface';
import { dataSessionIDBInterface, UserIndexedDBInterface } from '../indexed-db/interfaces/indexed-db.interface';

const loadFromlocalStorage = (item: string) => {
  const _storage = localStorage.getItem(item);
  return _storage ? JSON.parse(_storage) : null;
};

interface user {
  usuario: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private db: IndexedDbService,
    private jwt: JwtHelperService,
    private encrypt: EncryptService
  ) {}

  /**
   * Inicia sesión de usuario en el sistema.
   *
   * @template T - Tipo genérico para la respuesta esperada.
   * @param user - Objeto con credenciales del usuario { usuario, password }.
   * @returns Promesa con la respuesta del servidor en formato ResponseInterface<T>.
   *
   * Flujo:
   * 1. Envía credenciales al endpoint `session/login`.
   * 2. Si la autenticación es exitosa, crea la sesión en IndexedDB.
   * 3. Devuelve la respuesta del servidor o un error estructurado.
   */
  public async logIn<T>(user: user): Promise<ResponseInterface<T>> {
    try {
      const response: ResponseInterface<any> = await firstValueFrom(this.http.post('session/login', user));

      //Si las autenticación del usuario ha sido correcta se procede a registrar la sesion}
      if (response?.data?.code === 'LOGIN_SUCCESS') {
        /* const projects: any = await firstValueFrom(this.http.post('proyectos/permisos', user));*/
        const session = await this.crearSesion(response?.data?.user);
        if (!session)
          throw new Error('No se podido generar una sesión de usuario por inconcistencia de respuesta al servidor');
      }

      return response;
    } catch (e) {
      //Error generico por inicio de sesion
      return {
        success: false,
        httpCode: 409,
        codeError: 'AuthError',
        message: 'Se ha producido un error inesperado o no registrado en el sistema.',
        errors: {
          message: e instanceof Error ? e.message : 'Error desconocido',
          error: '',
          statusCode: 409
        }
      };
    }
  }

  /**
   * Realiza la reactivación automática de la sesión del usuario.
   * * Este método actúa como un "Silent Login". Recupera las credenciales
   * encriptadas desde IndexedDB y las utiliza para re-autenticar al usuario
   * contra el servidor sin intervención manual.
   * * @returns {Promise<boolean>}
   * - `true` si la sesión se reactivó correctamente tras un login exitoso.
   * - `false` si no hay datos en DB, la integridad es nula o el login falló.
   * * @async
   * @protected (o public, según tu implementación)
   */
  public async reactiveteSession(): Promise<boolean> {
    //Recuperar datos persistidos en la base de datos local (IndexedDB)
    const r: dataSessionIDBInterface = await this.obtenerDatosSesion();

    //Validación de integridad: Verifica que la respuesta exista y contenga la data necesaria
    if (!r || !r.success || !r.data) {
      return false;
    }

    // Se utiliza optional chaining y nullish coalescing para evitar errores de referencia
    const payload: user = {
      usuario: r.data?.usuario ?? '',
      password: r?.data?.session?.credential?.password ?? ''
    };

    //Intento de re-autenticación mediante el método logIn existente
    const login: any = await this.logIn(payload);
    return login?.success ?? false;
  }

  public async logOut<T>(): Promise<ResponseInterface<T>> {
    try {
      //Hacer metrica de sesión

      //Se elimina la sesión en curso por usuarios
      await this.db.deleteDatabase();

      return {
        success: true,
        httpCode: 200,
        codeError: 'Close session ok',
        message: 'Sesión terminada correctamente'
      };
    } catch (e) {
      //Error generico por inicio de sesion
      return {
        success: false,
        httpCode: 409,
        codeError: 'AuthError',
        message: 'Se ha producido un error inesperado o no registrado en el sistema.',
        errors: {
          message: e instanceof Error ? e.message : 'Error desconocido',
          error: '',
          statusCode: 409
        }
      };
    }
  }

  /**
   * Crea y registra la sesión del usuario en IndexedDB.
   *
   * @param user - Objeto con información del usuario y sus credenciales de sesión.
   * @returns Promesa booleana indicando si la sesión se creó correctamente.
   *
   * Flujo:
   * 1. Registra las llaves de encriptación en IndexedDB.
   * 2. Inicializa la base de datos local.
   * 3. Guarda los datos de sesión del usuario.
   */
  private async crearSesion(user: UserIndexedDBInterface): Promise<boolean> {
    try {
      //Se reinicia base datos
      await this.db.deleteDatabase();

      //Registros de llaves de encriptación
      await this.db.addKeys(user.session.credential.keys);

      //Se inicializa la db
      await this.db.initDataBase();

      //Se registra datos de sesión del usuario
      await this.db.addSession(user);
      localStorage.setItem('sesion', JSON.stringify({ usuario: user.usuario }));

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtienne los datos desesion del usuario la sesión del usuario en IndexedDB.
   *
   * @param user - Objeto con información del usuario y sus credenciales de sesión.
   * @returns Promesa datos de usuario indicando si la sesión se creó correctamente.
   *
   */
  public async obtenerDatosSesion(): Promise<dataSessionIDBInterface> {
    const sesion: { usuario: string; recordar?: boolean } = loadFromlocalStorage('sesion');
    if (!sesion) {
      return {
        success: false,
        message: `No existe una sesión activa`,
        data: null
      };
    }

    return this.db.getSessionById(sesion.usuario);
  }

  /**
   * Verifica si existe una sesión activa y si el token de acceso sigue siendo válido.
   * * @returns {Promise<boolean>} 'true' si el token es válido y vigente; 'false' si no hay sesión,
   * los datos están incompletos o el token ha expirado.
   */
  public async validarSesionActiva(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;

    // Verificación de expiración: Retorna la negación del estado de expiración (true si aún es vigente)
    return !this.jwt.isTokenExpired(token);
  }

  /**
   * Obtiene token de acceso.
   * * @returns {Promise<string |null>} null si el token no existe; valaor del token hay sesión,
   */
  public async getToken(): Promise<string | null> {
    // Obtiene los datos de la sesión desde el almacenamiento (IndexedDB)
    const r: dataSessionIDBInterface = await this.obtenerDatosSesion();

    // Validación de integridad: Si la respuesta no es exitosa o no contiene datos, la sesión no es válida
    if (!r || !r.success || !r.data) return null;

    // Extracción del token: Se obtiene el string y se elimina el prefijo 'Bearer ' en caso de existir
    return r.data.session.token ?? null;
  }

  /**
   * Obtiene codigo de acceso a proyectos por configuracióna usuario
   * * @returns {Promise<{ proyectoId: number; code: string }[]>}
   */
  public async accesosPermisos(): Promise<string[]> {
    // Obtiene los datos de la sesión desde el almacenamiento (IndexedDB)
    const r: dataSessionIDBInterface = await this.obtenerDatosSesion();

    // Validación de integridad: Si la respuesta no es exitosa o no contiene datos, la sesión no es válida
    if (!r || !r.success || !r.data) return [];

    return r.data?.accesos ?? [];
  }
}
