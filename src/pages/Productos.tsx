import { useState, useEffect } from "react";
import { useProductos } from "../hooks/useProductos";
import { productosService } from "../services/productos.service";
import { categoriasService } from "../services/categorias.service";
import { unidadesService } from "../services/unidades.service";
import { generarPlantillaExcel } from "../services/excel.service";
import type { ProductoData, CategoriaData, UnidadData } from "../types";
import Spinner from "../components/ui/Spinner";
import ModalCargaMasiva from "../components/ui/ModalCargaMasiva";

interface PresentacionItem {
  id?: string;
  id_unidad: string;
  nombre: string;
  precio: string; // manejado como string en el formulario para escritura libre
}

interface ProductoModalProps {
  producto?: ProductoData;
  categorias: CategoriaData[];
  unidades: UnidadData[];
  onClose: () => void;
  onSave: (payload: {
    id_categoria: string;
    codigo_producto: string;
    nombre: string;
    descripcion?: string;
    estado?: boolean;
    presentaciones: Array<{
      id?: string;
      id_unidad: string;
      nombre: string;
      precio: number;
    }>;
  }) => Promise<void>;
}

function ProductoModal({ producto, categorias, unidades, onClose, onSave }: ProductoModalProps) {
  const [codigo, setCodigo] = useState(producto?.codigo_producto || "");
  const [nombre, setNombre] = useState(producto?.nombre || "");
  const [descripcion, setDescripcion] = useState(producto?.descripcion || "");
  const [idCategoria, setIdCategoria] = useState(producto?.id_categoria || categorias[0]?.id || "");
  const [estado, setEstado] = useState(producto?.estado ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [presentaciones, setPresentaciones] = useState<PresentacionItem[]>(() => {
    if (producto?.presentaciones && producto.presentaciones.length > 0) {
      return producto.presentaciones.map((p) => ({
        id: p.id,
        id_unidad: p.id_unidad,
        nombre: p.nombre,
        precio: p.precio !== undefined && p.precio !== null ? String(p.precio) : "",
      }));
    }
    const defaultUnitId = unidades[0]?.id || "";
    return [{ id_unidad: defaultUnitId, nombre: "Unidad estándar", precio: "" }];
  });

  const addPresentacion = () => {
    const defaultUnitId = unidades[0]?.id || "";
    setPresentaciones((prev) => [
      ...prev,
      { id_unidad: defaultUnitId, nombre: "", precio: "" },
    ]);
  };

  const removePresentacion = (index: number) => {
    if (presentaciones.length <= 1) {
      setError("El producto debe tener al menos una presentación comercial de venta.");
      return;
    }
    setPresentaciones((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePresentacion = (index: number, field: keyof PresentacionItem, val: string) => {
    setPresentaciones((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || !nombre.trim() || !idCategoria) {
      setError("Por favor completa los campos obligatorios (Código, Nombre y Categoría).");
      return;
    }

    if (presentaciones.some((p) => !p.nombre.trim() || !p.id_unidad)) {
      setError("Todas las presentaciones deben tener nombre y una unidad de medida seleccionada.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSave({
        id_categoria: idCategoria,
        codigo_producto: codigo.trim().toUpperCase(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        estado,
        presentaciones: presentaciones.map((p) => ({
          id: p.id,
          id_unidad: p.id_unidad,
          nombre: p.nombre.trim(),
          precio: parseFloat(p.precio.replace(",", ".")) || 0,
        })),
      });
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Error al guardar producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#E8E8E8" }}>
          <div>
            <h2 className="font-bold text-base text-[#1E1E1E]">
              {producto ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <p className="text-xs text-[#808080] mt-0.5">
              Configura los datos del catálogo y sus unidades de venta
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-[#808080] hover:text-[#1E1E1E]">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-lg text-xs bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Código de Producto *</label>
                <input
                  className="input-field font-mono uppercase text-sm"
                  placeholder="Ej: ACE-5W30, FLT-001..."
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Estado</label>
                <select
                  className="select-field text-sm"
                  value={estado ? "true" : "false"}
                  onChange={(e) => setEstado(e.target.value === "true")}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Nombre del Producto / Repuesto *</label>
              <input
                className="input-field text-sm"
                placeholder="Ej: Aceite Sintético Castrol Magnatec 5W-30"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Categoría *</label>
              <select
                className="select-field text-sm"
                value={idCategoria}
                onChange={(e) => setIdCategoria(e.target.value)}
                required
              >
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Descripción Técnica (Opcional)</label>
              <textarea
                className="input-field py-2 text-sm h-18 resize-none"
                placeholder="Especificaciones, viscosidad, compatibilidad o notas..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            {/* Presentaciones de Venta */}
            <div className="border-t pt-4" style={{ borderColor: "#E8E8E8" }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="label !mb-0 font-bold">Presentaciones y Precios de Venta</label>
                  <p className="text-[11px] text-[#808080]">
                    Asocia cada presentación comercial a una unidad de medida registrada
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPresentacion}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 font-semibold"
                >
                  + Agregar Presentación
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                {presentaciones.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row gap-2.5 p-3 rounded-lg border bg-[#FAFAFA]"
                    style={{ borderColor: "#E8E8E8" }}
                  >
                    <div className="flex-1">
                      <label className="text-[10px] uppercase font-bold text-[#808080] block mb-1">
                        Nombre Comercial
                      </label>
                      <input
                        className="input-field text-xs"
                        placeholder="Ej: Envase 1 Galón, Botella 1 Litro"
                        value={p.nombre}
                        onChange={(e) => updatePresentacion(idx, "nombre", e.target.value)}
                        required
                      />
                    </div>

                    <div className="w-full sm:w-40">
                      <label className="text-[10px] uppercase font-bold text-[#808080] block mb-1">
                        Unidad Medida
                      </label>
                      <select
                        className="select-field text-xs"
                        value={p.id_unidad}
                        onChange={(e) => updatePresentacion(idx, "id_unidad", e.target.value)}
                        required
                      >
                        {unidades.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.abreviatura ? `[${u.abreviatura}] ` : ""}{u.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-32">
                      <label className="text-[10px] uppercase font-bold text-[#808080] block mb-1">
                        Precio (S/)
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#808080]">
                          S/
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*[.,]?[0-9]*"
                          className="input-field pl-7 text-xs font-mono font-bold"
                          placeholder="0.00"
                          value={p.precio}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
                              updatePresentacion(idx, "precio", val);
                            }
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-end pb-0.5">
                      <button
                        type="button"
                        onClick={() => removePresentacion(idx)}
                        className="p-2 hover:bg-red-50 text-[#808080] hover:text-[#D32F2F] rounded-md transition-colors"
                        title="Eliminar presentación"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-[#FAFAFA] rounded-b-2xl" style={{ borderColor: "#E8E8E8" }}>
            <button type="button" className="btn-secondary text-xs" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary text-xs font-bold" disabled={loading}>
              {loading ? "Guardando..." : producto ? "Guardar Cambios" : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PresentacionesViewerModal({ producto, onClose }: { producto: ProductoData; onClose: () => void }) {
  const presentaciones = producto.presentaciones || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#E8E8E8" }}>
          <div>
            <span className="font-mono text-xs font-bold text-[#808080] uppercase">
              {producto.codigo_producto}
            </span>
            <h2 className="font-bold text-base text-[#1E1E1E] leading-tight">{producto.nombre}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-[#808080] hover:text-[#1E1E1E]">
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="text-xs font-bold uppercase text-[#808080] tracking-wider mb-3">
            Presentaciones Comerciales Registradas ({presentaciones.length})
          </div>

          {presentaciones.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#808080] border rounded-lg">
              No tiene presentaciones configuradas.
            </div>
          ) : (
            <div className="table-container bg-white border rounded-lg">
              <table>
                <thead>
                  <tr>
                    <th>Presentación</th>
                    <th>Unidad</th>
                    <th style={{ textAlign: "right" }}>Precio Venta</th>
                    <th style={{ textAlign: "center" }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {presentaciones.map((p) => (
                    <tr key={p.id}>
                      <td className="font-semibold text-xs text-[#1E1E1E]">{p.nombre}</td>
                      <td>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-gray-100 font-bold text-[#3D3D3D]">
                          {p.unidad?.abreviatura || p.unidad?.nombre || "-"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }} className="font-mono font-bold text-sm text-[#1E1E1E]">
                        S/ {Number(p.precio).toFixed(2)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={"badge " + (p.estado ? "badge-success" : "badge-neutral")}>
                          {p.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end px-6 py-3 border-t bg-[#FAFAFA] rounded-b-2xl" style={{ borderColor: "#E8E8E8" }}>
          <button className="btn-secondary text-xs" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Productos() {
  const { productosData, loading, refetch } = useProductos();
  const [categorias, setCategorias] = useState<CategoriaData[]>([]);
  const [unidades, setUnidades] = useState<UnidadData[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [estadoFilter, setEstadoFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showCargaMasiva, setShowCargaMasiva] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductoData | undefined>();
  const [viewProductPres, setViewProductPres] = useState<ProductoData | undefined>();

  // Cargar categorías y unidades reales desde Supabase
  useEffect(() => {
    const loadDependencies = async () => {
      try {
        const [cats, units] = await Promise.all([
          categoriasService.getAll(),
          unidadesService.getAll(),
        ]);
        setCategorias(cats);
        setUnidades(units);
      } catch (err) {
        console.error("Error al cargar dependencias de productos:", err);
      }
    };
    loadDependencies();
  }, []);

  const handleDescargarPlantilla = () => {
    generarPlantillaExcel(categorias, unidades);
  };

  const handleSave = async (payload: {
    id_categoria: string;
    codigo_producto: string;
    nombre: string;
    descripcion?: string;
    estado?: boolean;
    presentaciones: Array<{
      id?: string;
      id_unidad: string;
      nombre: string;
      precio: number;
    }>;
  }) => {
    if (editingProduct) {
      await productosService.update(editingProduct.id, payload);
    } else {
      await productosService.create(payload);
    }
    await refetch();
    setShowModal(false);
    setEditingProduct(undefined);
  };

  const handleToggleEstado = async (prod: ProductoData) => {
    try {
      await productosService.toggleEstado(prod.id, !prod.estado);
      await refetch();
    } catch (err: any) {
      alert("Error al cambiar estado: " + err.message);
    }
  };

  const handleDelete = async (prod: ProductoData) => {
    if (!confirm(`¿Eliminar el producto "${prod.nombre}" (${prod.codigo_producto})?`)) return;
    try {
      await productosService.softDelete(prod.id);
      await refetch();
    } catch (err: any) {
      alert("Error al eliminar: " + err.message);
    }
  };

  const filtered = productosData.filter((p) => {
    const matchSearch =
      !search ||
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo_producto.toLowerCase().includes(search.toLowerCase()) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(search.toLowerCase()));

    const matchCat = catFilter === "all" || p.id_categoria === catFilter;
    const matchEst =
      estadoFilter === "all" ||
      (estadoFilter === "active" && p.estado) ||
      (estadoFilter === "inactive" && !p.estado);

    return matchSearch && matchCat && matchEst;
  });

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1E1E1E]">Catálogo de Productos y Repuestos</h1>
          <p className="text-sm mt-0.5 text-[#595959]">
            Gestión técnica de inventario, presentaciones de venta y lista de precios
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            className="btn-secondary text-xs uppercase tracking-wider flex items-center gap-2 font-bold"
            onClick={handleDescargarPlantilla}
            title="Descarga la plantilla con categorías y unidades reales"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Plantilla Excel
          </button>

          <button
            type="button"
            className="btn-secondary text-xs uppercase tracking-wider flex items-center gap-2 font-bold border-[#BFBFBF] hover:border-[#3D3D3D]"
            onClick={() => setShowCargaMasiva(true)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
            Carga Masiva
          </button>

          <button
            className="btn-primary text-xs uppercase tracking-wider font-bold"
            onClick={() => {
              if (categorias.length === 0 || unidades.length === 0) {
                alert("Debes registrar al menos una categoría y una unidad de medida primero.");
                return;
              }
              setEditingProduct(undefined);
              setShowModal(true);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="kpi-card">
          <span className="text-[10px] uppercase font-mono text-[#808080] block font-bold">Total Catálogo</span>
          <span className="text-2xl font-bold text-[#1E1E1E] mt-1 block">{productosData.length}</span>
        </div>
        <div className="kpi-card">
          <span className="text-[10px] uppercase font-mono text-[#808080] block font-bold">Activos</span>
          <span className="text-2xl font-bold text-[#2E7D32] mt-1 block">
            {productosData.filter((p) => p.estado).length}
          </span>
        </div>
        <div className="kpi-card">
          <span className="text-[10px] uppercase font-mono text-[#808080] block font-bold">Categorías Válidas</span>
          <span className="text-2xl font-bold text-[#1E1E1E] mt-1 block">{categorias.length}</span>
        </div>
        <div className="kpi-card">
          <span className="text-[10px] uppercase font-mono text-[#808080] block font-bold">Presentaciones Totales</span>
          <span className="text-2xl font-bold text-[#3D3D3D] mt-1 block">
            {productosData.reduce((acc, curr) => acc + (curr.presentaciones?.length || 0), 0)}
          </span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="card !p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <svg width="15" height="15" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#808080]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="input-field pl-10 text-xs"
            placeholder="Buscar por código, nombre o especificación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="select-field w-auto text-xs"
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
        >
          <option value="all">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <select
          className="select-field w-auto text-xs"
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>

      {/* Tabla de Productos */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Spinner size={32} />
        </div>
      ) : (
        <div className="table-container bg-white">
          <table>
            <thead>
              <tr>
                <th style={{ width: "14%" }}>Código</th>
                <th style={{ width: "26%" }}>Producto</th>
                <th style={{ width: "18%" }}>Categoría</th>
                <th style={{ width: "16%" }}>Presentaciones</th>
                <th style={{ width: "10%" }}>Estado</th>
                <th style={{ width: "16%", textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#808080] text-sm">
                    No se encontraron productos registrados en el sistema.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const presCount = p.presentaciones?.length || 0;
                  return (
                    <tr key={p.id} className="table-row-hover">
                      <td>
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-[#E8E8E8] text-[#1E1E1E] border border-[#BFBFBF]">
                          {p.codigo_producto}
                        </span>
                      </td>
                      <td>
                        <div className="font-bold text-sm text-[#1E1E1E]">{p.nombre}</div>
                        <div className="text-xs text-[#595959] mt-0.5 line-clamp-1">
                          {p.descripcion || <span className="text-[#A3A3A3] italic">Sin descripción</span>}
                        </div>
                      </td>
                      <td>
                        <span className="font-semibold text-xs px-2.5 py-1 rounded-full bg-[#FAFAFA] border border-[#BFBFBF] text-[#3D3D3D]">
                          {p.categoria?.nombre || "Sin Categoría"}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setViewProductPres(p)}
                          className="text-xs font-bold flex items-center gap-1.5 hover:underline text-[#3D3D3D] hover:text-[#D32F2F]"
                        >
                          <span>{presCount} presentación{presCount !== 1 ? "es" : ""}</span>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </td>
                      <td>
                        <span className={"badge " + (p.estado ? "badge-success" : "badge-neutral")}>
                          {p.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="btn-secondary py-1 px-2.5 text-xs"
                            onClick={() => {
                              setEditingProduct(p);
                              setShowModal(true);
                            }}
                          >
                            Editar
                          </button>
                          <button
                            className="btn-secondary py-1 px-2.5 text-xs"
                            onClick={() => handleToggleEstado(p)}
                            title={p.estado ? "Desactivar producto" : "Activar producto"}
                          >
                            {p.estado ? "Desactivar" : "Activar"}
                          </button>
                          <button
                            className="p-1.5 hover:bg-red-50 text-[#808080] hover:text-[#D32F2F] rounded-md transition-colors"
                            onClick={() => handleDelete(p)}
                            title="Eliminar producto"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modales */}
      {showModal && (
        <ProductoModal
          producto={editingProduct}
          categorias={categorias}
          unidades={unidades}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(undefined);
          }}
          onSave={handleSave}
        />
      )}

      {showCargaMasiva && (
        <ModalCargaMasiva
          onClose={() => setShowCargaMasiva(false)}
          onSuccess={async () => {
            await refetch();
          }}
          onDescargarPlantilla={handleDescargarPlantilla}
        />
      )}

      {viewProductPres && (
        <PresentacionesViewerModal
          producto={viewProductPres}
          onClose={() => setViewProductPres(undefined)}
        />
      )}
    </div>
  );
}
