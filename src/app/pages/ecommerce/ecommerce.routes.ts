import { Routes } from '@angular/router';
import { authenticationGuard } from 'src/app/core/guards/authentication/authentication.guard';
import { ListaProductosComponent } from './lista-productos/lista-productos.component';
import { NuevoProductoComponent } from './nuevo-producto/nuevo-producto.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authenticationGuard],
    children: [
      { path: 'lista-productos', component: ListaProductosComponent },
      { path: 'nuevo-producto/:code', component: NuevoProductoComponent },
      { path: '**', redirectTo: 'ecommerce/lista-productos', pathMatch: 'full' }
    ]
  }
];
