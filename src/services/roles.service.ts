import { supabase } from "../lib/supabase";
import type { Rol } from "../types";

export const rolesService = {
  async getAll(): Promise<Rol[]> {
    const { data, error } = await supabase
      .from("roles")
      .select("id, nombre, code, descripcion, estado")
      .neq("eliminado", true)
      .order("nombre");
    if (error) throw error;
    return data ?? [];
  },
};
