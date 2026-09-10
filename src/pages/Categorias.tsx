import { useState, useEffect } from "react";
import { categoriasService } from "../services/categorias.service";
import type { CategoriaData } from "../types";
import Spinner from "../components/ui/Spinner";

interface ModalCategoriaProps {
  categoria?: CategoriaData;
  onClose: () => void;
  onSave: (cat: { nombre: string; descripcion?: string }) => Promise<void>;
}

function ModalCategoria({ categoria, onClose, onSave }: ModalCategoriaProps) {
  const [nombre, setNombre] = useState(categoria?.nombre || "");
  const [descripcion, setDescripcion] = useState(categoria?.descripcion || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSave({ nombre: nombre.trim(), descripcion: descripcion.trim() });
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Error al guardar la categoría.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#E8E8E8" }}>
          <h2 className="font-bold text-base text-[#1E1E1E]">
            {categoria ? "Editar Categoría" : "Nueva Categoría"}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-[#808080] hover:text-[#1E1E1E]">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 flex flex-col gap-4">
            {error && (
              <div className="p-3 rounded-lg text-xs bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="label">Nombre de Categoría</label>
              <input
                className="input-field text-sm"
                placeholder="Ej. Lubricantes y Grasas, Frenos, Filtros..."
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Descripción (Opcional)</label>
              <textarea
                className="input-field py-2 text-sm h-24 resize-none"
                placeholder="Detalle o alcance de los productos pertenecientes a esta categoría..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-[#FAFAFA] rounded-b-2xl" style={{ borderColor: "#E8E8E8" }}>
            <button type="button" className="btn-secondary text-xs" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary text-xs" disabled={loading}>
              {loading ? "Guardando..." : categoria ? "Actualizar" : "Crear Categoría"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Categorias() {
  const [categorias, setCategorias] = useState<CategoriaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoriaData | undefined>();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await categoriasService.getAll();
      setCategorias(data);
    } catch (err: any) {
      console.error("Error al cargar categorías:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data: { nombre: string; descripcion?: string }) => {
    if (editingCat) {
      await categoriasService.update(editingCat.id, data);
    } else {
      await categoriasService.create(data);
    }
    await loadData();
  };

  const handleToggleEstado = async (cat: CategoriaData) => {
    try {
      await categoriasService.toggleEstado(cat.id, !cat.estado);
      await loadData();
    } catch (err: any) {
      alert("Error al cambiar estado: " + err.message);
    }
  };

  const handleDelete = async (cat: CategoriaData) => {
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"? Los productos vinculados deberán ser reasignados.`)) return;
    try {
      await categoriasService.softDelete(cat.id);
      await loadData();
    } catch (err: any) {
      alert("Error al eliminar: " + err.message);
    }
  };

  const filtered = categorias.filter((c) => {
    const matchSearch =
      !search ||
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (c.descripcion && c.descripcion.toLowerCase().includes(search.toLowerCase()));
    const matchEst =
      estadoFilter === "all" ||
      (estadoFilter === "active" && c.estado) ||
      (estadoFilter === "inactive" && !c.estado);
    return matchSearch && matchEst;
  });

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1E1E1E]">Categorías de Productos</h1>
          <p className="text-sm mt-0.5 text-[#595959]">
            Clasificación técnica para inventario, repuestos e insumos del taller
          </p>
        </div>
        <button
          className="btn-primary text-xs uppercase tracking-wider"
          onClick={() => {
            setEditingCat(undefined);
            setShowModal(true);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva Categoría
        </button>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="kpi-card">
          <span className="text-[10px] uppercase font-mono text-[#808080] block font-bold">Total Categorías</span>
          <span className="text-2xl font-bold text-[#1E1E1E] mt-1 block">{categorias.length}</span>
        </div>
        <div className="kpi-card">
          <span className="text-[10px] uppercase font-mono text-[#808080] block font-bold">Activas</span>
          <span className="text-2xl font-bold text-[#2E7D32] mt-1 block">
            {categorias.filter((c) => c.estado).length}
          </span>
        </div>
        <div className="kpi-card col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-mono text-[#808080] block font-bold">Inactivas</span>
          <span className="text-2xl font-bold text-[#808080] mt-1 block">
            {categorias.filter((c) => !c.estado).length}
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
            placeholder="Buscar por nombre o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select-field w-auto text-xs"
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
        </select>
      </div>

      {/* Tabla de Datos */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Spinner size={32} />
        </div>
      ) : (
        <div className="table-container bg-white">
          <table>
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Nombre</th>
                <th>Descripción</th>
                <th style={{ width: "15%" }}>Estado</th>
                <th style={{ width: "18%", textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-[#808080] text-sm">
                    No se encontraron categorías registradas.
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => (
                  <tr key={cat.id} className="table-row-hover">
                    <td>
                      <span className="font-bold text-sm text-[#1E1E1E]">{cat.nombre}</span>
                    </td>
                    <td className="text-xs text-[#595959]">
                      {cat.descripcion || <span className="text-[#A3A3A3] italic">Sin descripción</span>}
                    </td>
                    <td>
                      <span className={"badge " + (cat.estado ? "badge-success" : "badge-neutral")}>
                        {cat.estado ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="btn-secondary py-1 px-2.5 text-xs"
                          onClick={() => {
                            setEditingCat(cat);
                            setShowModal(true);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-secondary py-1 px-2.5 text-xs"
                          onClick={() => handleToggleEstado(cat)}
                          title={cat.estado ? "Desactivar categoría" : "Activar categoría"}
                        >
                          {cat.estado ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          className="p-1.5 hover:bg-red-50 text-[#808080] hover:text-[#D32F2F] rounded-md transition-colors"
                          onClick={() => handleDelete(cat)}
                          title="Eliminar categoría"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ModalCategoria
          categoria={editingCat}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
