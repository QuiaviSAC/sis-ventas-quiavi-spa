import { supabase } from "../lib/supabase";
import type { ProductoData, PresentacionData, Producto, Presentacion } from "../types";

export interface CreateProductoPayload {
  id_categoria: string;
  codigo_producto: string;
  nombre: string;
  descripcion?: string;
  estado?: boolean;
  presentaciones?: Array<{
    id_unidad: string;
    nombre: string;
    precio: number;
    estado?: boolean;
  }>;
}

export interface UpdateProductoPayload {
  id_categoria?: string;
  codigo_producto?: string;
  nombre?: string;
  descripcion?: string;
  estado?: boolean;
  presentaciones?: Array<{
    id?: string;
    id_unidad: string;
    nombre: string;
    precio: number;
    estado?: boolean;
  }>;
}

// Convertidor para mantener compatibilidad con vistas dependientes (Inventario, Ventas)
export function mapToLegacyProducto(prod: ProductoData): Producto {
  const firstPres = prod.presentaciones?.[0];
  const unidadName = firstPres?.unidad?.abreviatura || firstPres?.unidad?.nombre || "UND";

  return {
    id: prod.id,
    codigo: prod.codigo_producto,
    nombre: prod.nombre,
    descripcion: prod.descripcion || "",
    categoria: prod.categoria?.nombre || "General",
    id_categoria: prod.id_categoria,
    unidadPrincipal: unidadName,
    estado: prod.estado ? "Activo" : "Inactivo",
    presentaciones: (prod.presentaciones || []).map((p: PresentacionData): Presentacion => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      activa: p.estado,
      id_unidad: p.id_unidad,
      unidad: p.unidad,
    })),
  };
}

export const productosService = {
  async getAll(): Promise<ProductoData[]> {
    const { data, error } = await supabase
      .from("productos")
      .select(`
        id,
        id_categoria,
        codigo_producto,
        nombre,
        descripcion,
        estado,
        eliminado,
        fecha_creacion,
        categoria:categorias(id, nombre, estado),
        presentaciones:presentaciones(
          id,
          id_producto,
          id_unidad,
          nombre,
          precio,
          estado,
          eliminado,
          unidad:unidades(id, nombre, abreviatura)
        )
      `)
      .neq("eliminado", true)
      .order("nombre");

    if (error) throw error;

    return (data ?? []).map((prod: any) => ({
      ...prod,
      presentaciones: (prod.presentaciones || []).filter((p: any) => p.eliminado !== true),
    }));
  },

  async getAllLegacy(): Promise<Producto[]> {
    const data = await this.getAll();
    return data.map(mapToLegacyProducto);
  },

  async getById(id: string): Promise<ProductoData | null> {
    const { data, error } = await supabase
      .from("productos")
      .select(`
        id,
        id_categoria,
        codigo_producto,
        nombre,
        descripcion,
        estado,
        eliminado,
        fecha_creacion,
        categoria:categorias(id, nombre, estado),
        presentaciones:presentaciones(
          id,
          id_producto,
          id_unidad,
          nombre,
          precio,
          estado,
          eliminado,
          unidad:unidades(id, nombre, abreviatura)
        )
      `)
      .eq("id", id)
      .neq("eliminado", true)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      presentaciones: (data.presentaciones || []).filter((p: any) => p.eliminado !== true),
    };
  },

  async create(payload: CreateProductoPayload): Promise<ProductoData> {
    const { presentaciones = [], ...prodData } = payload;

    // 1. Insertar el Producto
    const { data: prod, error: prodErr } = await supabase
      .from("productos")
      .insert({
        id_categoria: prodData.id_categoria,
        codigo_producto: prodData.codigo_producto.trim().toUpperCase(),
        nombre: prodData.nombre.trim(),
        descripcion: prodData.descripcion?.trim() || null,
        estado: prodData.estado ?? true,
        eliminado: false,
      })
      .select()
      .single();

    if (prodErr) throw prodErr;

    // 2. Insertar las Presentaciones si existen
    if (presentaciones.length > 0) {
      const presToInsert = presentaciones.map((p) => ({
        id_producto: prod.id,
        id_unidad: p.id_unidad,
        nombre: p.nombre.trim(),
        precio: Number(p.precio) || 0,
        estado: p.estado ?? true,
        eliminado: false,
      }));

      const { error: presErr } = await supabase
        .from("presentaciones")
        .insert(presToInsert);

      if (presErr) {
        console.error("Error al crear presentaciones:", presErr);
        throw presErr;
      }
    }

    return prod;
  },

  async update(id: string, payload: UpdateProductoPayload) {
    const { presentaciones, ...prodData } = payload;

    // 1. Actualizar datos base del producto
    const updatePayload: Record<string, unknown> = {
      fecha_actualizacion: new Date().toISOString(),
    };

    if (prodData.id_categoria !== undefined) updatePayload.id_categoria = prodData.id_categoria;
    if (prodData.codigo_producto !== undefined) updatePayload.codigo_producto = prodData.codigo_producto.trim().toUpperCase();
    if (prodData.nombre !== undefined) updatePayload.nombre = prodData.nombre.trim();
    if (prodData.descripcion !== undefined) updatePayload.descripcion = prodData.descripcion?.trim() || null;
    if (prodData.estado !== undefined) updatePayload.estado = prodData.estado;

    const { error: updateErr } = await supabase
      .from("productos")
      .update(updatePayload)
      .eq("id", id);

    if (updateErr) throw updateErr;

    // 2. Si se pasaron presentaciones, sincronizar (nuevas vs actualizadas)
    if (presentaciones) {
      for (const p of presentaciones) {
        if (p.id) {
          // Actualizar existente
          await supabase
            .from("presentaciones")
            .update({
              id_unidad: p.id_unidad,
              nombre: p.nombre.trim(),
              precio: Number(p.precio) || 0,
              estado: p.estado ?? true,
              fecha_actualizacion: new Date().toISOString(),
            })
            .eq("id", p.id);
        } else {
          // Crear nueva presentación asociada
          await supabase
            .from("presentaciones")
            .insert({
              id_producto: id,
              id_unidad: p.id_unidad,
              nombre: p.nombre.trim(),
              precio: Number(p.precio) || 0,
              estado: p.estado ?? true,
              eliminado: false,
            });
        }
      }
    }
  },

  async toggleEstado(id: string, nuevoEstado: boolean) {
    const { error } = await supabase
      .from("productos")
      .update({
        estado: nuevoEstado,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  },

  async softDelete(id: string) {
    const { error } = await supabase
      .from("productos")
      .update({
        eliminado: true,
        estado: false,
        fecha_eliminacion: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  },

  async deletePresentacion(presentacionId: string) {
    const { error } = await supabase
      .from("presentaciones")
      .update({
        eliminado: true,
        estado: false,
        fecha_eliminacion: new Date().toISOString(),
      })
      .eq("id", presentacionId);

    if (error) throw error;
  },
};
