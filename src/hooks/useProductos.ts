import { useEffect, useState, useCallback } from "react";
import { productosService } from "../services/productos.service";
import type { Producto } from "../types";

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productosService.getAll();
      setProductos(data);
    } catch (e: any) {
      setError(e.message ?? "Error cargando productos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { productos, loading, error, refetch, setProductos };
}
