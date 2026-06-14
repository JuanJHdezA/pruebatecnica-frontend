import { HttpInterceptorFn } from '@angular/common/http';
import { EncryptService } from '../../services/encrypt/encrypt.service';
import { from, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { IndexedDbService } from '../../services/indexed-db/indexed-db.service';
import { environment } from '../../../../environment/environment';

export const RequestInterceptor: HttpInterceptorFn = (req, next) => {
  //Inyección del servicio EncryptService);
  const encrypt = inject(EncryptService);
  const auth = inject(AuthService);
  const dbIndexed = inject(IndexedDbService);

  /* Enpoint de la solicitud */
  const service: string = req?.urlWithParams?.toLowerCase() ?? req?.url?.toLowerCase();

  /*Como estandar para la generación de llaves de encriptación solo se toma el enpoint final de la solicitud*/
  const url = service.replaceAll(`${environment.SERVICE}/`, '');

  /*Url fuera de sesión */
  const initURL: string[] = ['session/login'];

  /*Pametros por formData */
  const isFormData = req.body instanceof FormData;

  /* Token de acceso según la sessión activa dentro de aplicación */
  const token$ = from(getToken(req.body, initURL.includes(url), encrypt, auth, url));

  /* Encriptación de datos según el ambiente de despliegue */
  const cipher$ = from(encryption(req.body, encrypt, dbIndexed, initURL.includes(url)));

  return forkJoin([token$, cipher$]).pipe(
    switchMap(([token, cipher]) => {
      const _url = `${environment.SERVICE}/${req.url}`.replace(
        `${environment.SERVICE}/${environment.SERVICE}/`,
        `${environment.SERVICE}/`
      );

      //Cabeceras
      const headers: any = {
        Authorization: token,
        'X-Api-Key': environment.APIKEY ?? environment.KEY_BOARDIN,
        'X-Chanel': environment.CHANEL_SERVICE,
        'X-Vector-Key': environment.IV ?? environment.VECTOR_KEY,
        'X-Code-Boarding': environment.CODE_BOARDIN
      };

      /*Si los parametros son diferente a FormData se aplica el formato json*/
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      //Se clona solicitud, para posterior ingresar la consiguración para con el consumo de las apis de "Tablero Ejecutivo"
      const clonedRequest = req.clone({
        setHeaders: headers,
        body: isFormData ? req.body : cipher,
        url: _url
      });

      /* Solicitud Https */
      return next(clonedRequest);
    })
  );
};

/**
 * Obtiene un token de acceso para las solicitudes HTTP.
 *
 * @template T - Tipo genérico del payload enviado en la solicitud.
 * @param payload - Datos enviados en la petición (ej. credenciales de login).
 * @param login - Bandera que indica si la petición corresponde al endpoint de login.
 * @param encrypt - Servicio de cifrado inyectado vía Angular DI.
 * @returns Promise<string> - Token generado o recuperado.
 *
 * Flujo:
 * - Si es login: cifra el payload y retorna el token generado.
 * - Si no es login: intenta recuperar el token desde IndexedDB (stub).
 * - En caso de error: retorna cadena vacía y loguea el error.
 */
async function getToken<T>(
  payload: T,
  login: boolean,
  encrypt: EncryptService,
  auth: AuthService,
  url: string
): Promise<string> {
  let token: string = '';

  const service = url.replaceAll(`${environment.SERVICE}/`, '');

  if (login) {
    /* Fuera de sesión */
    const res: any = { ...payload };
    delete res?.key;
    const data = await encrypt.cifrarDatos({ data: res });
    token = data?.cipher ?? '';
  } else {
    /* En sesión */
    const user = await auth.obtenerDatosSesion();
    token = user?.data?.session?.token ?? '';
  }

  const keys = await encrypt.generateTimeBasedKey(url);
  const authorization = await encrypt.cifrarDatos({ ...keys, data: token });

  return `Bearer ${authorization.cipher ?? ''}`;
}

/**
 * Encripta el payload de la solicitud según el ambiente de despliegue.
 *
 * @template T - Tipo genérico del payload enviado en la solicitud.
 * @param payload - Datos enviados en la petición (ej. cuerpo de un POST).
 * @param encrypt - Servicio de cifrado inyectado vía Angular DI.
 * @returns Promise<{ data: any }> - Objeto con la propiedad `data` que contiene
 *                                   el payload encriptado (producción) o sin modificar (desarrollo).
 *
 * Flujo:
 * - Construye las llaves de cifrado (APIKEY, IV, payload serializado).
 * - Si el ambiente es producción:
 *   - Intenta cifrar el payload con `EncryptService`.
 *   - Retorna el valor cifrado o cadena vacía si falla.
 * - Si el ambiente es desarrollo:
 *   - Retorna el payload original sin cifrar.
 * - En caso de error: retorna `{ data: '' }` y loguea el error.
 */
async function encryption<T>(
  payload: T,
  encrypt: EncryptService,
  dbIndexed: IndexedDbService,
  initApp: boolean
): Promise<{ data: any }> {
  let body: any = payload;

  if (initApp) {
    delete body.usuario;
    delete body.password;
    payload = body;
  }

  /* Llaves de encriptación */
  const keys = {
    key: dbIndexed.keys().key ?? environment.KEY_BOARDIN,
    iv: dbIndexed.keys().iv ?? environment.VECTOR_KEY,
    data: payload
  };

  if (environment.production) {
    /* Si existen parametros que requieren cifrados de datos */
    if (payload) {
      let data = await encrypt.cifrarDatos(keys);

      return { data: data.cipher ?? '' };
    }

    return { data: '' };
  }

  return { data: payload };
}
