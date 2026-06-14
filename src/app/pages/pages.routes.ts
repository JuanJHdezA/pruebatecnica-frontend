import { Routes } from '@angular/router';
import { authenticationGuard } from '../core/guards/authentication/authentication.guard';
import { LayoutComponent } from './main/layout/layout.component';
import { BienvenidaComponent } from './bienvenida/bienvenida.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authenticationGuard],
    children: [
      { path: 'bienvenida', component: BienvenidaComponent },
      { path: 'ecommerce', loadChildren: () => import('./ecommerce/ecommerce.routes').then((m) => m.routes) },
      { path: '**', redirectTo: 'control/bienvenida', pathMatch: 'full' }
    ]
  }
];
