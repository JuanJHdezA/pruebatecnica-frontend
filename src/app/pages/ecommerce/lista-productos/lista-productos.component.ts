import { Component, inject, OnInit, signal } from '@angular/core';
import { PrimeNGModule } from '@modules/primeng.module';
import { ProductoComponent } from '../producto/producto.component';
import { ListaproductosService } from './services/listaproductos.service';
import { ProductosInterface } from './interfaces/lista-productos.component.interface';
import console from 'node:console';
import { ResponseInterface } from 'src/app/core/interfaces/response.interface';

@Component({
  selector: 'app-lista-productos',
  imports: [PrimeNGModule, ProductoComponent],
  templateUrl: './lista-productos.component.html',
  styleUrl: './lista-productos.component.scss'
})
export class ListaProductosComponent implements OnInit {
  //Servicios
  private listaproductosServ = inject(ListaproductosService);

  //Variables
  public Productos = signal<ProductosInterface[]>([]);
  public loading = signal<boolean>(true);
  public working = signal<boolean>(false);

  constructor() {}

  ngOnInit(): void {
    this.initComponent();
  }

  public async initComponent(): Promise<void> {
    const rps: ResponseInterface<ProductosInterface[]> = await this.listaproductosServ.consultarProductos();
    if (rps?.success) {
      this.Productos.set(rps.data ?? []);
    }

    this.loading.set(false);
  }

  public async eliminarProdcuto(producto?: ProductosInterface) {
    this.working.set(true);
    const payload: any = {
      idProducto: producto?.idProducto,
      urlImagen: producto?.urlImagen
    };

    const rps: ResponseInterface<ProductosInterface> = await this.listaproductosServ.eliminarProducto(payload);
    if (rps?.success) {
      const _productos = this.Productos().filter((el) => {
        return el.codigoProducto !== producto?.codigoProducto;
      });
      this.Productos.set(_productos);
    }

    this.working.set(false);
  }
}
