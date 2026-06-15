import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PrimeNGModule } from '@modules/primeng.module';
import { ProductoComponent } from '../producto/producto.component';
import { ListaproductosService } from './services/listaproductos.service';
import { ProductosInterface } from './interfaces/lista-productos.component.interface';
import { ResponseInterface } from 'src/app/core/interfaces/response.interface';
import { CatNewProductsInterface } from '../nuevo-producto/interfaces/nuevo-producto.component.interface';

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
  public searchTerm = signal('');
  public pSearch = '';

  public selectedCategoria = signal<number | null>(null);

  //Filtro de búsquedas
  public ProductosFiltrados = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const catId = this.selectedCategoria(); // Filtro de categoría
    const listaOriginal = this.Productos();

    return listaOriginal.filter((p) => {
      const matchesTerm =
        !term || p.nombreProducto?.toLowerCase().includes(term) || p.descripcionProducto?.toLowerCase().includes(term);

      const matchesCategory = !catId || p.categorias?.some((c) => c.idCategoria === catId);
      return matchesTerm && matchesCategory;
    });
  });

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

  public filtrarPorTexto(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }
}
