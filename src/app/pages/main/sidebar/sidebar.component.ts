import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private _router = inject(Router);

  constructor() {}

  public mainComponent() {
    this._router.navigateByUrl('control/bienvenida').then();
  }
}
