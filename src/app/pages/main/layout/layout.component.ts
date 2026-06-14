import { Component, inject } from '@angular/core';
import { LayoutService } from './services/layout.service';
import { RouterModule } from '@angular/router';
import { TopbarComponent } from '../topbar/topbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  imports: [RouterModule, TopbarComponent, SidebarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  public _layoutService = inject(LayoutService);
}
