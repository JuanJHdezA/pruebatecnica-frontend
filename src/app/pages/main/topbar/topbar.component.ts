import { Component, inject } from '@angular/core';
import { PrimeNGModule } from '@modules/primeng.module';
import { LayoutService } from '../layout/services/layout.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  imports: [PrimeNGModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  private _router = inject(Router);

  //Servicios
  layoutService = inject(LayoutService);

  items = [
    {
      label: 'Perfil',
      icon: 'pi pi-user',
      command: () => this.ejecutarAccion('Perfil seleccionado')
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      command: () => this.ejecutarAccion('Configuración seleccionada')
    },
    {
      label: 'Calendario',
      icon: 'pi pi-calendar',
      command: () => this.ejecutarAccion('Calendario seleccionado')
    },
    {
      label: 'Bandeja de entrada',
      icon: 'pi pi-inbox',
      command: () => this.ejecutarAccion('Bandeja de entrada abierta')
    },
    { separator: true },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-power-off',
      command: () => this.logout()
    }
  ];

  constructor() {}

  // Función genérica para manejar los logs
  ejecutarAccion(mensaje: string) {
    console.log(`Acción ejecutada: ${mensaje}`);
  }

  // Lógica específica para el logout
  logout() {
    this._router.navigateByUrl('login').then();
    // Aquí iría tu servicio de autenticación: this.authService.logout();
  }

  toogleSidebar() {
    console.log('sidebar');

    this.layoutService.toggleSidebar();
  }
}
