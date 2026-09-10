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

export type Categoria =
  | "Pinturas"
  | "Solventes"
  | "Lubricantes"
  | "Repuestos"
  | "Refacciones"
  | "Herramientas"
  | "Accesorios"
  | "Limpieza";

export interface Presentacion {
  id: string;
  nombre: string;
  precio: number;
  activa: boolean;
}

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: Categoria;
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
