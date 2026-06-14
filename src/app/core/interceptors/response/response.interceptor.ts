import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { EncryptService } from '../../services/encrypt/encrypt.service';
import { catchError, switchMap } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { ErroRHandlerRespSPCONST as ErrorHandler } from './const/response.const';
import { IndexedDbService } from '../../services/indexed-db/indexed-db.service';
import { environment } from '../../../../environment/environment';

export const ResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const encrypt = inject(EncryptService);
  const dbIndexed = inject(IndexedDbService);

  return next(req).pipe(
    switchMap((event) => {
      if (event instanceof HttpResponse) {
        const rps: any = event.body;

        if (!rps?.pt) {
          return of(
            event.clone({
              body: {
                success: false,
                message:
                  'La operación solicitada no produjo una respuesta conforme al contrato esperado. El sistema no retornó datos válidos para la petición',
                data: null
              }
            })
          );
        }

        if (environment.production) {
          if (typeof rps?.pt === 'string') {
            // Convertimos la promesa en Observable
            const cipher$ = from(encryption(rps?.pt, encrypt, dbIndexed));
            return cipher$.pipe(
              switchMap((res) => {
                // Validación del resultado
                if (!res.data) {
                  // Si no hay data, devolvemos una respuesta personalizada
                  return of(
                    event.clone({
                      body: {
                        success: false,
                        message: 'Error al desencriptar la respuesta',
                        data: null
                      }
                    })
                  );
                }

                // Si hay data, devolvemos la respuesta transformada
                return of(event.clone({ body: res.data }));
              }),
              catchError((err) => {
                console.error('Error en desencriptado:', err);
                return of(
                  event.clone({
                    body: {
                      success: false,
                      message: 'Excepción en desencriptado',
                      data: null
                    }
                  })
                );
              })
            );
          }
        }

        //Respuesta
        return of(event.clone({ body: rps.pt }));
      }

      return of(event);
    }),
    catchError((error: HttpErrorResponse) => {
      const _err = error.error?.pt ?? {};

      if (!_err) {
        console.error(error?.error);
        return of(new HttpResponse({ body: ErrorHandler.ERROR_RESPONSE }));
      }

      console.error(_err);
      if (environment.production) {
        return from(encryption(_err, encrypt, dbIndexed)).pipe(
          switchMap((res) => {
            if (res.data) {
              return of(new HttpResponse({ body: res.data }));
            }

            return of(new HttpResponse({ body: ErrorHandler.ERROR_DECIPHER }));
          }),
          catchError((err) => {
            console.error('Error en desencriptado de error:', err);
            return of(new HttpResponse({ body: ErrorHandler.ERROR_DECIPHER }));
          })
        );
      }

      return of(new HttpResponse({ body: _err }));
    })
  );
};

/**
 * Desencripta la respuesta de la API según el ambiente.
 *
 * @template T - Tipo genérico del payload recibido.
 * @param cipher - Respuesta cifrada de la API.
 * @param encrypt - Servicio de cifrado inyectado vía Angular DI.
 * @returns Promise<{ data: any }> - Objeto con la propiedad `data` que contiene
 *                                   el payload descifrado (producción) o sin modificar (desarrollo).
 */
async function encryption<T>(
  cipher: string,
  encrypt: EncryptService,
  dbIndexed: IndexedDbService
): Promise<{ data: any }> {
  try {
    const keys = {
      key: dbIndexed.keys()?.key ?? environment.KEY_BOARDIN,
      iv: dbIndexed.keys()?.iv ?? environment.CODE_BOARDIN,
      encrypted: cipher
    };

    const data = await encrypt.descrifrarDatos(keys);
    return { data: data?.data ?? '' };
  } catch (error) {
    console.error('Error en función encryption:', error);
    return { data: '' };
  }
}
