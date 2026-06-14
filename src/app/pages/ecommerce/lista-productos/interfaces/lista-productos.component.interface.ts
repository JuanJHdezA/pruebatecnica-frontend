export interface ProductosInterface {
  idProducto?: number;
  createdAt?: string;
  codigoProducto?: string;
  nombreProducto?: string;
  descripcionProducto?: string;
  precio?: number;
  stock?: number;
  idEstatus?: number;
  idMarca?: number;
  imagen?: {
    type?: string;
    content: string;
  };
  urlImagen?: string;
  tipoArchivo?: string;
  tallas?: ProductosTallas[];
  categorias?: ProductosCategorias[];
  catEstatus?: {
    severity: 'success' | 'error' | 'info' | 'secondary' | 'warn';
    icon_estatus: string;
    codigo_estatus: string;
    nombre_estatus: string;
  };
  catMarcas?: { nombre_marca: string };
}

export interface ProductosCategorias {
  idProductoCategoria?: number;
  createdAt?: string;
  idProducto?: number;
  idCategoria?: number;
}

export interface ProductosTallas {
  idProductoTalla?: number;
  createdAt?: string;
  idProducto?: number;
  idTalla?: number;
}
