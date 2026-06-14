import { Injectable } from '@angular/core';
import {
  DecryptServiceInterface,
  encryptResponseInterface,
  EncryptServiceInterface
} from './interface/encrypt.interface';
import { environment } from '../../../../environment/environment';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptService {
  /**
   * Cifra datos utilizando una clave y un vector de inicialización (IV).
   *
   * Este método recibe un objeto o cadena, lo convierte en un payload serializado
   * y lo pasa al servicio de cifrado. Si no se proporciona `key` o `iv`, se utilizan
   * los valores por defecto definidos en `environments.deployment.keys`.
   *
   * @param {string} key - Clave de cifrado. Si está vacía, se usa la clave por defecto.
   * @param {string} iv - Vector de inicialización. Si está vacío, se usa el IV por defecto.
   * @param {any} data - Datos a cifrar. Puede ser objeto o cadena. Es obligatorio.
   *
   * @returns {Promise<encryptResponseInterface>} Promesa que resuelve con el resultado del cifrado:
   * - `error`: indica si ocurrió un error.
   * - `message`: mensaje descriptivo del resultado.
   * - `cipher`: texto cifrado en caso de éxito.
   *
   * @throws Error si el parámetro `data` no se proporciona o si el proceso de cifrado falla.
   *
   * @example
   * const result = await cifrarDatos({ key:'miClave', iv:'miIV', data:{ usuario: 'juan' } });
   */
  public async cifrarDatos(payload: { key?: string; iv?: string; data: any }): Promise<encryptResponseInterface> {
    try {
      if (!payload.data) {
        throw new Error(
          'No se ha ingreado el valor para genera un cifrado correcto: El parámetro data es un campo requerido'
        );
      }

      let _data: string = '';
      switch (typeof payload.data) {
        case 'object':
          _data = JSON.stringify(payload?.data);
          break;

        case 'boolean':
        case 'number':
          _data = String(payload?.data);
          break;

        case 'string':
          _data = payload?.data?.trim();
          break;

        default:
          throw new Error(
            `Se recibió un valor indefinido o no configurado. El parámetro "data" es inválido. Tipo recibido: ${typeof payload?.data}.`
          );
      }

      const data = {
        key: payload?.key ?? environment.KEY_BOARDIN,
        iv: payload?.iv ?? environment.CODE_BOARDIN,
        data: _data
      };

      const encrypt: encryptResponseInterface = await this.encrypt(data);
      if (!encrypt.success) {
        throw new Error(encrypt?.message);
      }

      return encrypt;
    } catch (error) {
      return { success: true, message: 'Data encrypt failed', cipher: '' };
    }
  }

  /**
   * Genera un par de llaves deterministas (Key e IV) basadas en el tiempo.
   *
   * La función utiliza una semilla de texto y el bloque de tiempo actual (minuto)
   * para crear valores que rotan automáticamente cada 60 segundos. Mientras se
   * mantenga el mismo minuto y el mismo string de entrada, el resultado será idéntico.
   *
   * @param text - String base (semilla) para generar las llaves.
   * @returns Un objeto con dos propiedades:
   *  - `key`: Cadena hexadecimal de 32 caracteres (SHA-256 parcial).
   *  - `iv`: Cadena hexadecimal de 18 caracteres (SHA-256 parcial).
   *
   * @example
   * const { key, iv } = service.generateTimeBasedKey("mi-secreto");
   */
  public async generateTimeBasedKey(text: string): Promise<{ key: string; iv: string }> {
    // Calcula el bloque de tiempo actual (Unix Timestamp / 60,000 ms)
    // Esto asegura que la semilla cambie exactamente al inicio de cada minuto.
    const minuteBlock = Math.floor(Date.now() / 60000);

    // Generación de Key: Se concatena el input, el bloque de tiempo y un sufijo único
    const seed1 = `${text}-${minuteBlock}-key1`;
    const _key = CryptoJS.SHA256(seed1).toString(CryptoJS.enc.Hex).substring(0, 32);

    // Generación de IV: Se usa un sufijo diferente para asegurar que IV y Key no sean iguales
    const seed2 = `${text}-${minuteBlock}-key2`;
    const _iv = CryptoJS.SHA256(seed2).toString(CryptoJS.enc.Hex).substring(0, 18);

    return { key: _key, iv: _iv };
  }

  /**
   * Descifra datos previamente cifrados utilizando una clave y un vector de inicialización (IV).
   *
   * Este método recibe un texto cifrado y lo pasa al servicio de descifrado. Si no se proporciona
   * `key` o `iv`, se utilizan los valores por defecto definidos en `environments.deployment.keys`.
   *
   * @param {string} key - Clave de descifrado. Si está vacía, se usa la clave por defecto.
   * @param {string} iv - Vector de inicialización. Si está vacío, se usa el IV por defecto.
   * @param {string} encrypted - Texto cifrado que se desea descifrar. Es obligatorio.
   *
   * @returns {Promise<encryptResponseInterface>} Promesa que resuelve con el resultado del descifrado:
   * - `error`: indica si ocurrió un error.
   * - `message`: mensaje descriptivo del resultado.
   * - `data`: datos descifrados en caso de éxito.
   *
   * @throws Error si el parámetro `encrypted` no se proporciona o si el proceso de descifrado falla.
   *
   * @example
   * const result = await descrifrarDatos({ key:'miClave', iv:'miIV', encrypted:'textoCifrado...' });
   */
  public async descrifrarDatos(payload: {
    encrypted: string;
    key?: string;
    iv?: string;
  }): Promise<encryptResponseInterface> {
    try {
      if (!payload.encrypted) {
        throw new Error('No se ha ingreado el valor del cifrado: El parámetro encrypted es un campo requerido');
      }

      const data = {
        key: payload?.key ?? environment.KEY_BOARDIN,
        iv: payload?.iv ?? environment.CODE_BOARDIN,
        cipher: payload.encrypted
      };

      const encrypt: encryptResponseInterface = await this.decrypt(data);
      if (!encrypt.success) {
        throw new Error(encrypt?.message);
      }

      return encrypt;
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Error desconocido';
      return { success: false, message: errMsg, data: null };
    }
  }

  /**
   * Encripta datos utilizando AES-CBC con PKCS7.
   *
   * @param cipher - Objeto que contiene:
   *   - `data`: Información en texto plano que se desea encriptar.
   *   - `key`: Llave de encriptación en formato UTF-8.
   *   - `iv`: Vector de inicialización en formato UTF-8.
   *
   * @returns Objeto con:
   *   - `error`: Indica si la operación falló.
   *   - `message`: Mensaje descriptivo del resultado.
   *   - `cipher`: Texto cifrado en base64.
   *
   * @throws Error genérico si ocurre un problema durante el proceso de encriptación.
   */
  private async encrypt(cipher: EncryptServiceInterface): Promise<encryptResponseInterface> {
    try {
      const key: any = CryptoJS.enc.Utf8.parse(cipher.key); // Llave de encriptación
      const _iv: any = CryptoJS.enc.Utf8.parse(cipher.iv); // Vector de inicialización

      const encryption = CryptoJS.AES.encrypt(cipher.data, key, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: _iv
      });

      return { success: true, message: 'Data encrypt success', cipher: encryption.toString() };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Error desconocido';
      return { success: false, message: errMsg, cipher: '' };
    }
  }

  /**
   * Desencripta datos previamente cifrados con AES-CBC.
   *
   * @param data - Objeto que contiene:
   *   - `cipher`: Texto cifrado en base64.
   *   - `key`: Llave de encriptación en formato UTF-8.
   *   - `iv`: Vector de inicialización en formato UTF-8.
   *
   * @returns Objeto con:
   *   - `error`: Indica si la operación falló.
   *   - `message`: Mensaje descriptivo del resultado.
   *   - `data`: Información desencriptada en su formato original (JSON o string).
   *
   * @throws Error con mensaje `Malformed data` si el contenido no puede ser interpretado.
   */
  private async decrypt(data: DecryptServiceInterface): Promise<encryptResponseInterface> {
    try {
      const key: any = CryptoJS.enc.Utf8.parse(data.key); // Llave de encriptación
      const iv: any = CryptoJS.enc.Utf8.parse(data.iv); // Vector de inicialización

      const { Utf8 } = CryptoJS.enc;
      const params: any = CryptoJS.AES.decrypt(data.cipher, key, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: iv
      }).toString(Utf8);

      if (!params) {
        throw new Error('Malformed data');
      }

      let rps;
      try {
        const parsed = JSON.parse(params);
        // Verificamos que sea un objeto o arreglo
        rps = parsed && typeof parsed === 'object' ? parsed : params;
      } catch (error) {
        rps = params.toString();
      }

      return { success: true, message: 'Data decrypt success', data: rps };
    } catch (e: any) {
      return { success: false, message: e.message, data: null };
    }
  }

  /**
   * Genera una clave AES-128 e IV derivados del path de la URL y la fecha actual.
   * Usa SHA-256 como función de derivación determinística.
   * @param url - URL del endpoint a partir del cual se generará el par key/iv
   * @returns Objeto con `key` (32 hex chars = 16 bytes) e `iv` (16 hex chars = 8 bytes)
   */
  public async generarKeyIVEndpoint(url: string): Promise<{ key: string; iv: string }> {
    // Fecha actual en formato YYYY-MM-DD (UTC, evita diferencias por zona horaria)
    const fechaNormalizada = new Date().toISOString().split('T')[0];

    // Solo el path de la URL para que el resultado sea independiente del dominio
    const path = new URL(url).pathname;

    // Hash SHA-256 del string "path|fecha"
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${path}|${fechaNormalizada}`));

    // Convertir el hash a hexadecimal (64 chars en total)
    const hashHex = Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Los primeros 32 chars son la key y los siguientes 16 el iv
    return {
      key: hashHex.slice(0, 32), // 16 bytes — clave AES-128
      iv: hashHex.slice(32, 48) // 8 bytes  — vector de inicialización
    };
  }
}
