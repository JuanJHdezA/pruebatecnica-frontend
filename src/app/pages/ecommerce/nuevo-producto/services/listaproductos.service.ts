import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ResponseInterface } from 'src/app/core/interfaces/response.interface';
import { delay } from 'rxjs/operators';
import { CreateProductoService } from '../interfaces/nuevo-producto.service.interface';

@Injectable({
  providedIn: 'root'
})
export class ListaproductosService {
  private enpoint: string = 'productos';
  constructor(private http: HttpClient) {}

  public async catalogos<T>(): Promise<ResponseInterface<T>> {
    try {
      //Agragamos un tiempo considerable para el efecto de carga de datos
      const obs$ = this.http.get<ResponseInterface<T>>(`${this.enpoint}/catalogos`).pipe(delay(1000));

      return await firstValueFrom(obs$);
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

  public async registrarProducto<T>(producto: CreateProductoService): Promise<ResponseInterface<T>> {
    try {
      //Agragamos un tiempo considerable para el efecto de carga de datos
      const api = producto?.idProducto ? 'actualizar-producto' : 'nuevo-producto';
      const obs$ = this.http.post<ResponseInterface<T>>(`${this.enpoint}/${api}`, producto).pipe(delay(1000));
      return await firstValueFrom(obs$);
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

  public async consultarProductos<T>(codeProducto?: string): Promise<ResponseInterface<T>> {
    try {
      const response: ResponseInterface<any> = await firstValueFrom(
        this.http.post(`${this.enpoint}`, { codigoProducto: codeProducto ?? null })
      );
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
}
