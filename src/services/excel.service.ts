import * as XLSX from "xlsx";
import { supabase } from "../lib/supabase";
import type { CategoriaData, UnidadData } from "../types";

export interface ExcelImportError {
  fila: number;
  codigo: string;
  campo: string;
  mensaje: string;
}

export interface ExcelImportResponse {
  success: boolean;
  message?: string;
  total_filas?: number;
  total_errores?: number;
  total_insertados?: number;
  errors?: ExcelImportError[];
  error?: string;
}

/**
 * Genera y descarga un archivo Excel dinámico con:
 * - Hoja 1: "Productos" (con encabezados técnicos y filas de ejemplo).
 * - Hoja 2: "Catálogos de Referencia" (categorías y unidades activas de la BD para que el usuario no se equivoque).
 */
export function generarPlantillaExcel(categorias: CategoriaData[], unidades: UnidadData[]) {
  const wb = XLSX.utils.book_new();

  // 1. Hoja "Productos"
  const encabezados = [
    {
      codigo_producto: "ACE-5W30-01",
      nombre_producto: "Aceite Sintético Castrol Magnatec 5W-30",
      descripcion: "Lubricante de alta gama para motores gasolina y diésel",
      categoria: categorias[0]?.nombre || "Lubricantes",
      nombre_presentacion: "Galón 4 Litros",
      unidad_medida: unidades[0]?.abreviatura || unidades[0]?.nombre || "GLN",
      precio_venta: 145.5,
    },
    {
      codigo_producto: "FLT-ACE-02",
      nombre_producto: "Filtro de Aceite Blindado Bosch",
      descripcion: "Filtro de aceite roscado universal",
      categoria: categorias[1]?.nombre || categorias[0]?.nombre || "Filtros",
      nombre_presentacion: "Unidad",
      unidad_medida: unidades.find(u => u.abreviatura === "UND")?.abreviatura || "UND",
      precio_venta: 28.0,
    },
  ];

  const wsProductos = XLSX.utils.json_to_sheet(encabezados, {
    header: [
      "codigo_producto",
      "nombre_producto",
      "descripcion",
      "categoria",
      "nombre_presentacion",
      "unidad_medida",
      "precio_venta",
    ],
  });

  // Ajuste visual de anchos de columna
  wsProductos["!cols"] = [
    { wch: 18 }, // codigo_producto
    { wch: 38 }, // nombre_producto
    { wch: 45 }, // descripcion
    { wch: 22 }, // categoria
    { wch: 25 }, // nombre_presentacion
    { wch: 16 }, // unidad_medida
    { wch: 15 }, // precio_venta
  ];

  // 2. Hoja "Catálogos de Referencia"
  const catRows = categorias.map((c) => ({
    "CATEGORÍAS DISPONIBLES": c.nombre,
    "DESCRIPCIÓN CATEGORÍA": c.descripcion || "",
  }));

  const unitRows = unidades.map((u) => ({
    "UNIDADES DISPONIBLES": u.nombre,
    "ABREVIATURA VÁLIDA": u.abreviatura || "",
    "DESCRIPCIÓN UNIDAD": u.descripcion || "",
  }));

  const wsCatalogos = XLSX.utils.json_to_sheet(
    catRows.map((cat, i) => {
      const unit = unitRows[i] || {
        "UNIDADES DISPONIBLES": "",
        "ABREVIATURA VÁLIDA": "",
        "DESCRIPCIÓN UNIDAD": "",
      };
      return {
        ...cat,
        ...unit,
      };
    })
  );

  wsCatalogos["!cols"] = [
    { wch: 28 },
    { wch: 35 },
    { wch: 25 },
    { wch: 20 },
    { wch: 30 },
  ];

  XLSX.utils.book_append_sheet(wb, wsProductos, "Productos");
  XLSX.utils.book_append_sheet(wb, wsCatalogos, "Catálogos de Referencia");

  // Descargar el archivo
  XLSX.writeFile(wb, "Plantilla_Carga_Masiva_Productos_Motorix.xlsx");
}

/**
 * Invoca la Supabase Edge Function 'excel-dynamic' enviando el archivo Excel vía FormData.
 * Extrae tanto respuestas exitosas como errores de validación HTTP 422 (All-or-Nothing).
 */
export async function subirExcelMasivo(file: File): Promise<ExcelImportResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || "";

  const formData = new FormData();
  formData.append("file", file);

  const { data, error } = await supabase.functions.invoke("excel-dynamic", {
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (error) {
    console.warn("Respuesta de Edge Function con error o validación:", error);

    // 1. Si Supabase JS client adjunta el body en error.context
    if (error.context) {
      try {
        if (typeof error.context.json === "function") {
          const bodyJson = await error.context.json();
          if (bodyJson && (bodyJson.errors || bodyJson.message || bodyJson.error)) {
            return bodyJson as ExcelImportResponse;
          }
        }
        if (typeof error.context.text === "function") {
          const bodyText = await error.context.text();
          const parsed = JSON.parse(bodyText);
          if (parsed && (parsed.errors || parsed.message || parsed.error)) {
            return parsed as ExcelImportResponse;
          }
        }
      } catch {
        // continuar a fallbacks
      }
    }

    // 2. Si el error viene dentro de data (algunas versiones de supabase-js colocan el json en data incluso con status 4xx)
    if (data && ((data as any).errors || (data as any).error || (data as any).message)) {
      return data as ExcelImportResponse;
    }

    return {
      success: false,
      error: error.message ?? "Error al procesar el archivo Excel en el servidor",
    };
  }

  // Si data contiene flag de fallo retornado normalmente
  if (data && typeof data === "object") {
    return data as ExcelImportResponse;
  }

  return {
    success: true,
    message: "Operación completada con éxito",
  };
}
