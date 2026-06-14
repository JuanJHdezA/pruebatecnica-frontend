import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ResponseInterface } from 'src/app/core/interfaces/response.interface';

@Injectable({
  providedIn: 'root'
})
export class ListaproductosService {
  private enpoint: string = 'productos';
  constructor(private http: HttpClient) {}

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

  public async eliminarProducto<T>(producto: { idProducto: number; urlImagen: string }): Promise<ResponseInterface<T>> {
    try {
      const response: ResponseInterface<any> = await firstValueFrom(
        this.http.post(`${this.enpoint}/eliminar-producto`, producto)
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
