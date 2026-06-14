export interface CreateProductoService {
  idProducto?: number | null;
  nombreProducto: string;
  descripcionProducto?: string;
  categorias: string[];
  idMarca: number;
  precio: number;
  stock: number;
  tallas: string[];
  idEstatus: number;
  imagen: string;
  UpdateImg?: boolean;
  urlImgAnterior?: string;
  tipoArchivo?: string;
}
