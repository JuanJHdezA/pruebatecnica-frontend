import { Routes } from '@angular/router';
import { LoginComponent } from '@components/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'control', loadChildren: () => import('./pages/pages.routes').then((m) => m.routes) },
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];
