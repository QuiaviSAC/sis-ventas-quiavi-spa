import { supabase } from "../lib/supabase";
import type { Venta, LineaVenta } from "../types";

function mapVenta(row: any): Venta {
  return {
    id: row.id,
    numero: row.numero ?? "",
    fecha: row.fecha ?? "",
    cliente: row.cliente ?? "",
    lineas: (row.lineas_venta ?? []).map((l: any): LineaVenta => ({
      id: l.id,
      productoId: l.producto_id ?? l.productoId ?? "",
      presentacionId: l.presentacion_id ?? l.presentacionId ?? "",
      cantidad: l.cantidad ?? 0,
      precioUnitario: l.precio_unitario ?? l.precioUnitario ?? 0,
    })),
    subtotal: row.subtotal ?? 0,
    descuento: row.descuento ?? 0,
    total: row.total ?? 0,
    estado: row.estado ?? "Pendiente",
    usuario: row.usuario ?? "",
  };
}

export const ventasService = {
  async getAll(): Promise<Venta[]> {
    const { data, error } = await supabase
      .from("ventas")
      .select("*, lineas_venta(*)")
      .order("fecha", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapVenta);
  },

  async create(venta: Omit<Venta, "id" | "numero">) {
    const { lineas, ...head } = venta;
    const { data: v, error } = await supabase
      .from("ventas")
      .insert(head)
      .select()
      .single();
    if (error) throw error;
    if (lineas.length > 0) {
      const { error: le } = await supabase.from("lineas_venta").insert(
        lineas.map((l) => ({
          venta_id: v.id,
          producto_id: l.productoId,
          presentacion_id: l.presentacionId,
          cantidad: l.cantidad,
          precio_unitario: l.precioUnitario,
        }))
      );
      if (le) throw le;
    }
    return v;
  },
};
