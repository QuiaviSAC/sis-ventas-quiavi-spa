import { useEffect, useState, useCallback } from "react";
import { productosService, mapToLegacyProducto } from "../services/productos.service";
import type { ProductoData, Producto } from "../types";

export function useProductos() {
  const [productosData, setProductosData] = useState<ProductoData[]>([]);
  const [productosLegacy, setProductosLegacy] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productosService.getAll();
      setProductosData(data);
      setProductosLegacy(data.map(mapToLegacyProducto));
    } catch (e: any) {
      console.error("Error cargando productos:", e);
      setError(e.message ?? "Error cargando productos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    productos: productosLegacy,
    productosData,
    loading,
    error,
    refetch,
    setProductos: setProductosLegacy,
  };
}
