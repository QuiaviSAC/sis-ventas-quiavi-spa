import { supabase } from "../lib/supabase";
import type { Producto, Presentacion } from "../types";

function mapProducto(row: any): Producto {
  return {
    id: row.id,
    codigo: row.codigo ?? "",
    nombre: row.nombre ?? "",
    descripcion: row.descripcion ?? "",
    categoria: row.categoria,
    unidadPrincipal: row.unidad_principal ?? row.unidadPrincipal ?? "",
    estado: row.estado ?? "Activo",
    presentaciones: (row.presentaciones ?? []).map((p: any): Presentacion => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      activa: p.activa ?? true,
    })),
  };
}

export const productosService = {
  async getAll(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from("productos")
      .select("*, presentaciones(*)")
      .order("nombre");
    if (error) throw error;
    return (data ?? []).map(mapProducto);
  },

  async create(
    data: Omit<Producto, "id" | "presentaciones"> & {
      presentaciones: Omit<Presentacion, "id">[];
    }
  ) {
    const { presentaciones, unidadPrincipal, ...rest } = data;
    const { data: prod, error } = await supabase
      .from("productos")
      .insert({ ...rest, unidad_principal: unidadPrincipal })
      .select()
      .single();
    if (error) throw error;
    if (presentaciones.length > 0) {
      const { error: pe } = await supabase
        .from("presentaciones")
        .insert(presentaciones.map((p) => ({ ...p, producto_id: prod.id })));
      if (pe) throw pe;
    }
    return prod;
  },

  async update(id: string, data: Partial<Omit<Producto, "id" | "presentaciones">>) {
    const payload: Record<string, unknown> = { ...data };
    if (data.unidadPrincipal) {
      payload.unidad_principal = data.unidadPrincipal;
      delete payload.unidadPrincipal;
    }
    const { error } = await supabase.from("productos").update(payload).eq("id", id);
    if (error) throw error;
  },

  async softDelete(id: string) {
    const { error } = await supabase
      .from("productos")
      .update({ estado: "Inactivo" })
      .eq("id", id);
    if (error) throw error;
  },
};
