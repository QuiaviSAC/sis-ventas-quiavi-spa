import { supabase } from "../lib/supabase";
import type { Rol, UsuarioData } from "../types";

export const rolesService = {
  async getAll(): Promise<Rol[]> {
    const { data, error } = await supabase
      .from("roles")
      .select("id, nombre, descripcion, estado")
      .eq("eliminado", false)
      .eq("estado", true)
      .order("nombre");
    if (error) throw error;
    return data ?? [];
  },
};

export const usuariosService = {
  async getAll(): Promise<UsuarioData[]> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, id_rol, user_name, nombre, apellidos, correo, estado, rol:roles(id, nombre, code, descripcion, estado)")
      .eq("eliminado", false)
      .order("fecha_creacion", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      id: row.id,
      id_rol: row.id_rol,
      user_name: row.user_name,
      nombre: row.nombre ?? "",
      apellidos: row.apellidos ?? "",
      correo: row.correo ?? "",
      estado: row.estado ?? true,
      rol: row.rol ?? undefined,
    }));
  },

  async createUsuarioAdmin(usuario: {
    id_rol: string;
    user_name: string;
    password: string;
    nombre: string;
    apellidos: string;
    correo: string;
  }) {
    // Si se crea desde el panel de administracion directamente en la tabla usuarios:
    const { data, error } = await supabase
      .from("usuarios")
      .insert({
        id_rol: usuario.id_rol,
        user_name: usuario.user_name,
        password: usuario.password,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        estado: true,
        eliminado: false,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async toggleEstado(id: string, nuevoEstado: boolean) {
    const { error } = await supabase
      .from("usuarios")
      .update({ estado: nuevoEstado, fecha_actualizacion: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async softDelete(id: string) {
    const { error } = await supabase
      .from("usuarios")
      .update({
        eliminado: true,
        estado: false,
        fecha_eliminacion: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
  },
};
