import { supabase } from "../lib/supabase";
import type { CategoriaData } from "../types";

export const categoriasService = {
  async getAll(): Promise<CategoriaData[]> {
    const { data, error } = await supabase
      .from("categorias")
      .select("id, nombre, descripcion, estado, eliminado, fecha_creacion, fecha_actualizacion")
      .neq("eliminado", true)
      .order("nombre");
    if (error) throw error;
    return data ?? [];
  },

  async create(categoria: { nombre: string; descripcion?: string }) {
    const { data, error } = await supabase
      .from("categorias")
      .insert({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion || null,
        estado: true,
        eliminado: false,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, categoria: { nombre?: string; descripcion?: string; estado?: boolean }) {
    const { data, error } = await supabase
      .from("categorias")
      .update({
        ...categoria,
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
      .from("categorias")
      .update({
        estado: nuevoEstado,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
  },

  async softDelete(id: string) {
    const { error } = await supabase
      .from("categorias")
      .update({
        eliminado: true,
        estado: false,
        fecha_eliminacion: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
  },
};
