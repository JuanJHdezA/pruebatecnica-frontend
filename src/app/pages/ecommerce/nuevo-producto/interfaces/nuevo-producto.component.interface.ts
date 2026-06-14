export interface CatNewProductsInterface {
  catCategorias: catCategoriasInterface[];
  catEstatus: catEstatus[];
  catTallas: catTallas[];
  catMarcas: catMarcas[];
}

export interface catCategoriasInterface {
  idCategoria?: string;
  createdAt?: string;
  codigoCategoria?: string;
  nombreCategoria?: string;
  descCategoria?: string;
  iconCategoria?: string;
}

export interface catEstatus {
  idEstatus?: number;
  createdAt?: string;
  codigoEstatus?: string;
  nombreEstatus?: string;
  descripcionEstatus?: string;
  iconEstatus?: string;
  severity?: 'success' | 'error' | 'info' | 'secondary' | 'warn';
}

export interface catSizesProductos {
  idSizeProducto?: number;
  createdAt?: string;
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  size?: null;
}

export interface catMarcas {
  idMarca?: number;
  createdAt?: string;
  nombreMarca?: string;
  descripcionMarca?: string;
}

export interface catTallas {
  idTalla: number;
  createdAt: string;
  codigoTalla: String;
  nombreTalla: string;
  descTalla: string;
}

export interface newProductoInterface {
  codigoProducto?: string;
  nombreProducto?: string;
  descripcionProducto?: string; // Opcional, como en tu DTO
  precio?: number;
  stock?: number;
  idColor?: number;
  idCategoria?: number;
  idSizeProducto?: number;
  idEstatus?: number;
}
