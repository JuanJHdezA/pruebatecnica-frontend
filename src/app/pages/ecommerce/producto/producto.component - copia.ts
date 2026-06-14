import { Component, inject, input, output } from '@angular/core';
import { ProductosInterface } from '../lista-productos/interfaces/lista-productos.component.interface';
import { PrimeNGModule } from '@modules/primeng.module';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-producto',
  imports: [PrimeNGModule],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.scss',
  providers: [ConfirmationService]
})
export class ProductoComponent {
  // Input definido como Signal
  public Productos = input.required<ProductosInterface[]>();
  public loading = input<boolean>(false);
  public onEliminar = output<ProductosInterface>();

  //Servicios
  private _router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  public getImage(producto: ProductosInterface) {
    return `${producto.imagen?.type ?? ''}${producto.imagen?.content ?? ''}`;
  }

  public agregarCarritoCompra() {}

  public editarProducto(producto: ProductosInterface) {
    this._router.navigateByUrl(`control/ecommerce/nuevo-producto/${producto?.codigoProducto}`).then();
  }

  public async eliminarProducto(producto: ProductosInterface) {
    this.confirmationService.confirm({
      message: `Deseas eliminar el artículo: ${producto.codigoProducto}`,
      header: 'Eliminar producto',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Eliminar',
        severity: 'danger'
      },

      accept: () => {
        this.onEliminar.emit(producto);
      }
    });
  }
}
