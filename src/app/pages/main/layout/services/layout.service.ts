import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ResponseInterface } from '../../../../core/interfaces/response.interface';
import { DataUserInterface } from '../interface/layout.services.interface';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  public usuario = signal<DataUserInterface>({});
  public loading = signal<boolean>(false);
  public SidebarVisible = signal<boolean>(true);
  public menu = signal<any>({});

  constructor(private http: HttpClient) {}

  public async menuUsuario(): Promise<void> {
    try {
      const response: ResponseInterface<any> = await firstValueFrom(this.http.get('accesos-permisos/menu-usuario'));

      console.log(response);
    } catch (e: any) {}
  }

  public toggleSidebar() {
    this.SidebarVisible.update((value) => !value);
  }
}
