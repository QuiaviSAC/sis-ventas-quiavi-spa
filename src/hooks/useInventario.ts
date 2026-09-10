import { useEffect, useState, useCallback } from "react";
import { inventarioService } from "../services/inventario.service";
import type { ItemInventario, MovimientoInventario } from "../types";

export function useInventario() {
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inv, movs] = await Promise.all([
        inventarioService.getInventario(),
        inventarioService.getMovimientos(),
      ]);
      setInventario(inv);
      setMovimientos(movs);
    } catch (e: any) {
      setError(e.message ?? "Error cargando inventario");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { inventario, movimientos, loading, error, refetch };
}
