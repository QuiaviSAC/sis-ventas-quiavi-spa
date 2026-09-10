import { supabase } from "../lib/supabase";
import type { UnidadData } from "../types";

export const unidadesService = {
  async getAll(): Promise<UnidadData[]> {
    const { data, error } = await supabase
      .from("unidades")
      .select("id, nombre, descripcion, abreviatura, estado, eliminado, fecha_creacion, fecha_actualizacion")
      .neq("eliminado", true)
      .order("nombre");
    if (error) throw error;
    return data ?? [];
  },

  async create(unidad: { nombre: string; abreviatura?: string; descripcion?: string }) {
    const { data, error } = await supabase
      .from("unidades")
      .insert({
        nombre: unidad.nombre,
        abreviatura: unidad.abreviatura ? unidad.abreviatura.toUpperCase() : null,
        descripcion: unidad.descripcion || null,
        estado: true,
        eliminado: false,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, unidad: { nombre?: string; abreviatura?: string; descripcion?: string; estado?: boolean }) {
    const { data, error } = await supabase
      .from("unidades")
      .update({
        ...unidad,
        abreviatura: unidad.abreviatura ? unidad.abreviatura.toUpperCase() : undefined,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async toggleEstado(id: string, nuevoEstado: boolean) {
    const { error } = await supabase
      .from("unidades")
      .update({
        estado: nuevoEstado,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
  },

  async softDelete(id: string) {
    const { error } = await supabase
      .from("unidades")
      .update({
        eliminado: true,
        estado: false,
        fecha_eliminacion: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
  },
};
