import { useEffect, useState, useCallback } from "react";
import { ventasService } from "../services/ventas.service";
import type { Venta } from "../types";

export function useVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ventasService.getAll();
      setVentas(data);
    } catch (e: any) {
      setError(e.message ?? "Error cargando ventas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { ventas, loading, error, refetch, setVentas };
}
