import { supabase } from "../lib/supabase";
import type { ItemInventario, MovimientoInventario } from "../types";

export const inventarioService = {
  async getInventario(): Promise<ItemInventario[]> {
    const { data, error } = await supabase.from("inventario").select("*");
    if (error) throw error;
    return (data ?? []).map((row: any): ItemInventario => ({
      productoId: row.producto_id ?? row.productoId ?? "",
      stockActual: row.stock_actual ?? row.stockActual ?? 0,
      stockMinimo: row.stock_minimo ?? row.stockMinimo ?? 0,
      ultimaActualizacion: row.ultima_actualizacion ?? row.ultimaActualizacion ?? "",
      proveedor: row.proveedor ?? "",
    }));
  },

  async getMovimientos(): Promise<MovimientoInventario[]> {
    const { data, error } = await supabase
      .from("movimientos_inventario")
      .select("*")
      .order("fecha", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row: any): MovimientoInventario => ({
      id: row.id,
      fecha: row.fecha,
      productoId: row.producto_id ?? row.productoId ?? "",
      tipo: row.tipo,
      cantidad: row.cantidad,
      usuario: row.usuario ?? "",
      observacion: row.observacion ?? "",
    }));
  },

  async registrarMovimiento(mov: Omit<MovimientoInventario, "id">) {
    const { productoId, ...rest } = mov;
    const { error } = await supabase
      .from("movimientos_inventario")
      .insert({ ...rest, producto_id: productoId });
    if (error) throw error;
  },
};
