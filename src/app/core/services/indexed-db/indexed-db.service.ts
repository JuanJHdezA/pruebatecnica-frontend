import { Injectable, signal } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { dataSessionIDBInterface, keysDBInterface, UserIndexedDBInterface } from './interfaces/indexed-db.interface';
import { EncryptService } from '../encrypt/encrypt.service';

interface DBSession {
  usuario?: string;
  details?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService extends Dexie {
  public keys = signal<keysDBInterface>({});
  private schema: string = 'pruebatecnica';
  public sessions!: Table<DBSession, string>;

  constructor(private encryptionServices: EncryptService) {
    super('pruebatecnica'); // nombre de la BD

    //Data Base
    this.version(1).stores({
      sessions: 'usuario,details'
    });
  }

  /**
   * Inicializa la base de datos en IndexedDB utilizando Dexie.
   *
   * @returns Promesa vacía (void), ya que solo prepara la base de datos para su uso.
   *
   * Flujo:
   * 1. Verifica si la base de datos definida en `this.schema` ya existe.
   *    - Si existe, la elimina para garantizar una inicialización limpia.
   * 2. Reinicia las llaves de usuario en memoria.
   * 3. Define la versión y estructura de la base de datos (stores).
   *    - En este caso, se crea la tabla `sessions` con índices en `usuario` y `details`.
   * 4. Fuerza la apertura de la base de datos para inicializarla.
   */
  public async initDataBase(): Promise<void> {
    //Se inicializan las llaves de usuario
    //this.keys.set({});

    //Data Base
    this.version(1).stores({
      sessions: 'usuario,details'
    });

    // Fuerza la apertura para inicializar la base de datos
    await this.open();

    this.sessions = this.table('sessions');
  }

  /**
   * Registra una nueva sesión de usuario en IndexedDB.
   *
   * @param user - Objeto con la información del usuario que se desea almacenar.
   * @returns Promesa booleana que indica si la operación fue exitosa.
   *
   * Flujo:
   * 1. Construye un payload con las llaves de encriptación y los datos del usuario.
   * 2. Cifra los datos mediante el servicio de encriptación.
   * 3. Registra la sesión en la colección `sessions` de IndexedDB.
   */
  public async addSession(user: UserIndexedDBInterface): Promise<boolean> {
    try {
      //Encriptación de datos de usuarios
      const payload: { key?: string; iv?: string; data: any } = {
        ...this.keys(),
        data: user
      };

      const data = await this.encryptionServices.cifrarDatos(payload);
      if (!data.success) {
        throw new Error(data?.message);
      }

      const keysCipher = await this.encryptionServices.cifrarDatos({ data: JSON.stringify(this.keys()) });
      if (!keysCipher.success) {
        throw new Error(keysCipher?.message);
      }

      //Registro de usuario
      await this.sessions.add({ usuario: user.usuario, details: data?.cipher ?? '' });

      //Registro de usuario
      await this.sessions.add({ usuario: 'temp', details: keysCipher?.cipher ?? '' });

      return true;
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Error desconocido no se ha podido crear una sesión en aplicación';
      console.error('Session no iniciada correctamente: ', message);
      return false;
    }
  }

  /**
   * Obtiene una sesión de usuario desde IndexedDB por su identificador.
   *
   * @param id - Identificador único de la sesión almacenada.
   * @returns Promesa con la respuesta en formato dataSessionIDBInterface.
   *
   * Flujo:
   * 1. Busca el usuario en la colección `sessions` usando el id.
   * 2. Construye un payload con las llaves de encriptación y los datos cifrados.
   * 3. Desencripta los datos mediante el servicio de encriptación.
   * 4. Si la desencriptación es exitosa, devuelve la sesión activa.
   * 5. Si ocurre un error, devuelve un objeto con success=false y el mensaje de error.
   */
  public async getSessionById(id: string): Promise<dataSessionIDBInterface> {
    try {
      // Recupera el usuario desde IndexedDB
      const user = await this.sessions.get(id);
      if (!user) throw new Error('Sesion no encontrada o caducada');

      //En caso de las llaves se hayan reiniciado, se restaura por la sesión temporal
      if (!this.keys()?.key) {
        await this.recoberyKeysSession();
      }

      //Se construye el payload con llaves y datos cifrados
      const payload: { key?: string; iv?: string; encrypted: string } = {
        ...this.keys(),
        encrypted: user?.details ?? ''
      };

      //Datos de sesión encriptados
      const data = await this.encryptionServices.descrifrarDatos(payload);
      if (!data.success) {
        throw new Error(data?.message);
      }

      // Devuelve la sesión activa con los datos desencriptados
      return { success: true, message: 'Session activa', data: data.data ?? null };
    } catch (e) {
      // Manejo de errores genéricos
      return { success: false, message: e instanceof Error ? e.message : 'Error desconocido' };
    }
  }

  // UPDATE
  async updateSession(user: UserIndexedDBInterface): Promise<boolean> {
    try {
      //Encriptación de datos de usuarios
      const payload: { key?: string; iv?: string; data: any } = {
        ...this.keys(),
        data: user
      };

      const data = await this.encryptionServices.cifrarDatos(payload);
      if (!data.success) {
        throw new Error(data?.message);
      }

      //Actualización de sesión
      await this.sessions.update(user.usuario, { details: data?.cipher ?? '' });

      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error desconocido no se ha podido actualizar la sesión';
      console.error('Session no actualizada correctamente: ', message);
      return false;
    }
  }
  // DELETE
  async deleteSesion(id: string): Promise<void> {
    return await this.sessions.delete(id);
  }

  // DROP DATABASE
  async deleteDatabase(): Promise<void> {
    // Verifica si la base de datos ya existe
    const exists = await Dexie.exists(this.schema);
    if (exists) {
      // Si existe, se elimina para reiniciar desde cero
      await Dexie.delete(this.schema);
    }

    //Se limpian llaves de sesión de usuario
    this.keys.set({});
  }

  /**
   * Registra las llaves de encriptación en memoria para la sesión actual.
   *
   * @param keys - Objeto que contiene la llave (`key`) y el vector de inicialización (`iv`).
   *               Ambos son opcionales y se utilizan para operaciones de cifrado/descifrado.
   * @returns Promesa vacía (void), ya que solo actualiza el estado interno de las llaves.
   *
   * Flujo:
   * 1. Recibe las llaves de encriptación.
   * 2. Si no se proporcionan, inicializa con un objeto vacío.
   * 3. Actualiza el almacenamiento interno de llaves
   */
  public async addKeys(keys: keysDBInterface): Promise<void> {
    // Actualiza las llaves de encriptación en memoria
    this.keys.set(keys ?? {});
  }

  /**
   * Recupera las llaves de encriptación persistidas tras una recarga de la aplicación (F5).
   * * @returns Promesa vacía (void).
   * * Flujo de recuperación:
   * 1. Consulta en la tabla `sessions` el registro bajo el alias 'temp'.
   * 2. Si el registro no existe, interrumpe el proceso (sesión expirada o inexistente).
   * 3. Intenta desencriptar el contenido de `details` utilizando las llaves maestras
   * estáticas definidas en el `EncryptService` / `environments`.
   * 4. Si el descifrado es exitoso, actualiza la Signal `keys` mediante `addKeys`,
   * rehidratando así el estado de memoria necesario para el Interceptor.
   * * @throws Error si el registro temporal no existe o si las llaves no pueden ser descifradas.
   */
  public async recoberyKeysSession(): Promise<void> {
    try {
      //Lectura del registro
      const temp = await this.sessions.get('temp');
      if (!temp) throw new Error('Sesión no encontrada o caducada');

      //Llaves de sesión
      const decrypt = await this.encryptionServices.descrifrarDatos({
        encrypted: temp?.details ?? ''
      });

      if (!decrypt?.success) throw new Error('Sesión no encontrada o caducada');

      //Reasiganción de valores de sesión
      await this.addKeys(decrypt?.data);
    } catch (error) {
      console.error(error);
    }
  }
}
