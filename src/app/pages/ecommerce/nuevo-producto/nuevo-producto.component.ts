import { Component, inject, signal } from '@angular/core';
import { PrimeNGModule } from '@modules/primeng.module';
import { NuevoProductosService } from './services/nuevoproducto.service';
import {
  catCategoriasInterface,
  catEstatus,
  CatNewProductsInterface,
  newProductoInterface
} from './interfaces/nuevo-producto.component.interface';
import { ResponseInterface } from 'src/app/core/interfaces/response.interface';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ProductosInterface } from '../lista-productos/interfaces/lista-productos.component.interface';
import { FileUploaderComponent } from '@components/file-uploader/file-uploader.component';

@Component({
  selector: 'app-nuevo-producto',
  imports: [PrimeNGModule, FormsModule, FileUploaderComponent],
  templateUrl: './nuevo-producto.component.html',
  styleUrl: './nuevo-producto.component.scss',
  providers: [MessageService]
})
export class NuevoProductoComponent {
  private _ActivatedRoute = inject(ActivatedRoute);
  private _LsProductsServices = inject(NuevoProductosService);
  private messageService = inject(MessageService);
  private _router = inject(Router);

  //Signals
  private producto = signal<ProductosInterface>({});
  public codeProduct = signal<string>('');
  public imageBase64 = signal<string>('');
  public loading = signal<boolean>(true);
  public UpdateImg = signal<boolean>(false);
  public fileUploaders = signal<number[]>([]);

  //Variables
  public catalogos = signal<CatNewProductsInterface>({
    catCategorias: [],
    catEstatus: [],
    catTallas: [],
    catMarcas: []
  });

  public frmProduct: FormGroup = new FormGroup({});

  constructor() {
    this.crearFormulario();

    //Codigo de registro
    const code = this._ActivatedRoute.snapshot.paramMap.get('code') ?? '';
    this.codeProduct.set(code === ':code' ? '' : code);
  }

  ngOnInit(): void {
    this.inicializarComponente();
  }

  private async inicializarComponente() {
    //Catalogos
    await this.getCatalogos();

    //Si el acceso es por edición
    await this.datosProductos();

    //Efecto de carga de datos
    this.loading.set(false);
  }

  private async datosProductos(): Promise<void> {
    if (this.codeProduct()) {
      const rps: ResponseInterface<ProductosInterface> = await this._LsProductsServices.consultarProductos(
        this.codeProduct()
      );
      if (rps?.success) {
        this.producto.set(rps.data ?? {});
        await this.asigarValores(this.producto());
      }
    }
  }

  private async getCatalogos(): Promise<void> {
    const rps: ResponseInterface<CatNewProductsInterface> = await this._LsProductsServices.catalogos();
    if (rps.success) {
      this.catalogos.set({
        catCategorias: rps?.data?.catCategorias ?? [],
        catEstatus: rps?.data?.catEstatus ?? [],
        catTallas: rps?.data?.catTallas ?? [],
        catMarcas: rps?.data?.catMarcas ?? []
      });
    }
  }

  private async crearFormulario(): Promise<void> {
    let estatus: catEstatus = {};
    if (this.catalogos()?.catEstatus) estatus = this.catalogos()?.catEstatus[0];

    this.frmProduct = new FormGroup({
      nombreProducto: new FormControl(null, [Validators.required]),
      descripcionProducto: new FormControl(null),
      categorias: new FormControl([], [Validators.required, Validators.min(1)]),
      marca: new FormControl(null, [Validators.required, Validators.min(0)]),
      precio: new FormControl(null, [Validators.required, Validators.min(0.01)]),
      stock: new FormControl(null, [Validators.required, Validators.min(0)]),
      tallas: new FormControl([], [Validators.required, Validators.min(1)]),
      estatus: new FormControl(estatus, [Validators.required, Validators.min(1)]),
      imagen: new FormControl(null, [Validators.required])
    });
  }

  private async asigarValores(data: ProductosInterface): Promise<void> {
    /**************Catalogos**************/
    //Categorias
    let categorias: any = [];
    if (data?.categorias) {
      categorias =
        data?.categorias
          .map((el) => this.catalogos().catCategorias.find((item) => item.idCategoria === el.idCategoria))
          .filter((cat): cat is NonNullable<typeof cat> => !!cat) ?? [];
    }

    let tallas: any = [];
    if (data?.tallas) {
      tallas =
        data?.tallas
          .map((el) => this.catalogos().catTallas.find((item) => item.idTalla === el.idTalla))
          .filter((cat): cat is NonNullable<typeof cat> => !!cat) ?? [];
    }

    const marca = this.catalogos().catMarcas.find((item) => item.idMarca === data.idMarca) ?? null;
    const estatus = this.catalogos().catEstatus.find((item) => item.idEstatus === data.idEstatus) ?? null;

    //Imagen
    const img = `${data?.imagen?.type ?? ''}${data?.imagen?.content ?? ''}`;
    this.imageBase64.set(img);
    this.UpdateImg.set(false);

    //Datos del Formulario
    this.frmProduct.patchValue({
      nombreProducto: data?.nombreProducto ?? '',
      descripcionProducto: data?.descripcionProducto ?? '',
      categorias: categorias,
      marca: marca,
      precio: data?.precio ?? null,
      stock: data?.stock ?? null,
      tallas: tallas,
      estatus: estatus,
      imagen: img
    });
  }

  public agregarCargador() {
    // Generamos un nuevo ID basado en la longitud actual
    const newId = this.fileUploaders().length + 1;

    if (newId <= 3) {
      this.fileUploaders.update((items) => [...items, newId]);
    }
  }

  public eliminarCargador(index: number) {
    this.fileUploaders.update((items) => items.filter((_, i) => i !== index));
  }

  public onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      // Validar tamaño (opcional, ej. 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy pesada. Máximo 5MB.');
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        this.imageBase64.set(base64String);
        this.frmProduct.patchValue({
          imagen: base64String
        });

        if (this.producto()?.idProducto) {
          this.UpdateImg.set(true);
        }
      };

      reader.onerror = (error) => {
        console.error('Error al leer el archivo: ', error);
      };

      reader.readAsDataURL(file); // Esto es lo que convierte a base64
    }
  }

  public async limpiarFormulario() {
    this.loading.set(true);
    this.frmProduct.reset();
    this.removerImagenAdunta();
    await this.crearFormulario();

    //Datos de usuarios (Edición)
    await this.datosProductos();

    this.loading.set(false);
  }

  public removerImagenAdunta() {
    this.imageBase64.set('');
    this.frmProduct.patchValue({
      imagen: null
    });
  }

  public async capturar() {
    if (this.frmProduct.status === 'INVALID') {
      // Este método es recursivo: marca el form y TODOS sus hijos (incluyendo tu componente custom)
      this.frmProduct.markAllAsTouched();

      // Opcional: forzar a Angular a que detecte el cambio de estado inmediatamente
      this.frmProduct.updateValueAndValidity();
      return;
    }

    this.loading.set(true);

    const categorias = this.frmProduct.value['categorias']?.map((el: any) => {
      return el.idCategoria;
    });
    const tallas = this.frmProduct.value['tallas']?.map((el: any) => {
      return el.idTalla;
    });

    const producto = {
      idProducto: this.producto()?.idProducto ?? null,
      codigoProducto: this.producto()?.codigoProducto ?? '',
      nombreProducto: this.frmProduct.value['nombreProducto'] ?? '',
      descripcionProducto: this.frmProduct.value['descripcionProducto'] ?? '',
      categorias: categorias,
      idMarca: this.frmProduct.value['marca']?.idMarca ?? '',
      precio: this.frmProduct.value['precio'] ?? 0,
      stock: this.frmProduct.value['stock'] ?? 0,
      tallas: tallas,
      idEstatus: this.frmProduct.value['estatus']?.idEstatus ?? '',
      imagen: this.frmProduct.value['imagen'] ?? '',
      UpdateImg: this.UpdateImg(),
      urlImgAnterior: this.producto()?.urlImagen ?? '',
      tipoArchivo: this.UpdateImg() == false ? (this.producto()?.tipoArchivo ?? '') : ''
    };

    const rps: ResponseInterface<any> = await this._LsProductsServices.registrarProducto(producto);
    if (!rps.success) {
      this.messageService.add({ severity: 'secondary', summary: 'Mensaje', detail: 'Producto no registrado' });
      this.loading.set(false);
      console.error(rps);
      return;
    }

    this.limpiarFormulario();
    this.messageService.add({
      severity: 'success',
      summary: 'Mensaje',
      detail: `Producto ${producto.idProducto ? 'actualizado' : 'registrado'}`
    });
  }

  public resegrarConsulta() {
    this._router.navigateByUrl('control/ecommerce/lista-productos').then();
  }
}
