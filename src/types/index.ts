export interface Rol {
  id: string;
  nombre: string;
  code?: string;
  descripcion?: string;
  estado: boolean;
}

export interface UsuarioData {
  id: string;
  id_rol: string;
  user_name: string;
  nombre: string;
  apellidos: string;
  correo: string;
  estado: boolean;
  rol?: Rol;
}

export interface CategoriaData {
  id: string;
  nombre: string;
  descripcion?: string;
  estado: boolean;
  eliminado?: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface UnidadData {
  id: string;
  nombre: string;
  descripcion?: string;
  abreviatura?: string;
  estado: boolean;
  eliminado?: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface PresentacionData {
  id: string;
  id_producto: string;
  id_unidad: string;
  nombre: string;
  precio: number;
  estado: boolean;
  eliminado?: boolean;
  unidad?: UnidadData;
}

export interface ProductoData {
  id: string;
  id_categoria: string;
  codigo_producto: string;
  nombre: string;
  descripcion?: string;
  estado: boolean;
  eliminado?: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  categoria?: CategoriaData;
  presentaciones?: PresentacionData[];
}

// Compatibilidad hacia atrás mientras se completan inventario y ventas
export type Categoria = string;

export interface Presentacion {
  id: string;
  nombre: string;
  precio: number;
  activa: boolean;
  id_unidad?: string;
  unidad?: UnidadData;
}

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  id_categoria?: string;
  unidadPrincipal: string;
  estado: "Activo" | "Inactivo";
  presentaciones: Presentacion[];
}

export interface ItemInventario {
  productoId: string;
  stockActual: number;
  stockMinimo: number;
  ultimaActualizacion: string;
  proveedor: string;
}

export interface MovimientoInventario {
  id: string;
  fecha: string;
  productoId: string;
  tipo: "Ingreso" | "Ajuste" | "Salida manual";
  cantidad: number;
  usuario: string;
  observacion: string;
}

export interface LineaVenta {
  id: string;
  productoId: string;
  presentacionId: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Venta {
  id: string;
  numero: string;
  fecha: string;
  cliente: string;
  lineas: LineaVenta[];
  subtotal: number;
  descuento: number;
  total: number;
  estado: "Completada" | "Pendiente" | "Anulada";
  usuario: string;
}

export interface Usuario {
  nombre: string;
  email: string;
  rol: string;
  avatar: string;
}
