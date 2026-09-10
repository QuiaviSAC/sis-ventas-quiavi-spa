import { useState } from "react";
import { useProductos } from "../hooks/useProductos";
import { productosService } from "../services/productos.service";
import type { Producto, Presentacion, Categoria } from "../types";
import Spinner from "../components/ui/Spinner";

const CATEGORIAS: Categoria[] = ["Pinturas","Solventes","Lubricantes","Repuestos","Refacciones","Herramientas","Accesorios","Limpieza"];
const UNIDADES = ["Balde","Galón","Litro","Kg","Unidad","Pliego","Caja","Par"];

function catBadge(cat: string) {
  const colors: Record<string, string> = {
    Pinturas: "badge-primary", Solventes: "badge-warning", Lubricantes: "badge-success",
    Repuestos: "badge-neutral", Refacciones: "badge-neutral", Herramientas: "badge-neutral",
    Accesorios: "badge-neutral", Limpieza: "badge-neutral",
  };
  return <span className={`badge ${colors[cat] || "badge-neutral"}`}>{cat}</span>;
}

function PresentacionesModal({ producto, onClose }: { producto: Producto; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
          <div>
            <div className="font-semibold">{producto.nombre}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>Presentaciones de venta</div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="px-6 py-4">
          <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--color-muted)" }}>
            Unidad principal: {producto.unidadPrincipal}
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Presentación</th><th>Precio</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {producto.presentaciones.map(p => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.nombre}</td>
                    <td className="font-mono font-semibold">S/ {p.precio.toFixed(2)}</td>
                    <td><span className={`badge ${p.activa ? "badge-success" : "badge-neutral"}`}>{p.activa ? "Activa" : "Inactiva"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: "#F8FAFC", color: "var(--color-muted)" }}>
            Estas presentaciones representan las unidades comerciales con las que se vende este producto al cliente.
            No afectan directamente el stock de inventario.
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProductoForm {
  codigo: string; nombre: string; descripcion: string;
  categoria: Categoria; unidadPrincipal: string; estado: "Activo" | "Inactivo";
  presentaciones: Presentacion[];
}

function ProductoModal({ producto, onClose, onSave }: {
  producto?: Producto; onClose: () => void; onSave: (p: ProductoForm) => void;
}) {
  const [form, setForm] = useState<ProductoForm>({
    codigo: producto?.codigo || "",
    nombre: producto?.nombre || "",
    descripcion: producto?.descripcion || "",
    categoria: producto?.categoria || "Pinturas",
    unidadPrincipal: producto?.unidadPrincipal || "Unidad",
    estado: producto?.estado || "Activo",
    presentaciones: producto?.presentaciones || [{ id: crypto.randomUUID(), nombre: "", precio: 0, activa: true }],
  });

  const addPresentacion = () => setForm(f => ({
    ...f, presentaciones: [...f.presentaciones, { id: crypto.randomUUID(), nombre: "", precio: 0, activa: true }]
  }));

  const removePresentacion = (id: string) => setForm(f => ({
    ...f, presentaciones: f.presentaciones.filter(p => p.id !== id)
  }));

  const updatePresentacion = (id: string, field: keyof Presentacion, value: string | number | boolean) => {
    setForm(f => ({ ...f, presentaciones: f.presentaciones.map(p => p.id === id ? { ...p, [field]: value } : p) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="font-semibold">{producto ? "Editar producto" : "Nuevo producto"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Código</label>
                <input className="input-field font-mono" value={form.codigo}
                  onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} required placeholder="PNT-001" />
              </div>
              <div>
                <label className="label">Estado</label>
                <select className="select-field" value={form.estado}
                  onChange={e => setForm(f => ({ ...f, estado: e.target.value as "Activo" | "Inactivo" }))}>
                  <option>Activo</option><option>Inactivo</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Nombre del producto</label>
              <input className="input-field" value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required placeholder="Ej: Pintura Automotriz Roja" />
            </div>
            <div>
              <label className="label">Descripción</label>
              <textarea className="input-field" rows={2} value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Descripción del producto..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Categoría</label>
                <select className="select-field" value={form.categoria}
                  onChange={e => setForm(f => ({ ...f, categoria: e.target.value as Categoria }))}>
                  {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Unidad principal</label>
                <select className="select-field" value={form.unidadPrincipal}
                  onChange={e => setForm(f => ({ ...f, unidadPrincipal: e.target.value }))}>
                  {UNIDADES.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>

            {/* Presentaciones */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-sm">Presentaciones de venta</div>
                  <div className="text-xs" style={{ color: "var(--color-muted)" }}>Unidades comerciales con sus precios</div>
                </div>
                <button type="button" onClick={addPresentacion} className="btn-secondary text-xs py-1.5 px-3">
                  + Agregar
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {form.presentaciones.map((p, i) => (
                  <div key={p.id} className="flex gap-2 items-center p-3 rounded-lg" style={{ background: "#F8FAFC", border: "1px solid var(--color-border)" }}>
                    <div className="text-xs font-bold w-5 text-center" style={{ color: "var(--color-muted)" }}>{i + 1}</div>
                    <input className="input-field text-sm flex-1" placeholder="Ej: 1/2 balde"
                      value={p.nombre} onChange={e => updatePresentacion(p.id, "nombre", e.target.value)} />
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-sm font-medium" style={{ color: "var(--color-muted)" }}>S/</span>
                      <input type="number" className="input-field text-sm w-24 pl-7" min={0} step={0.01}
                        value={p.precio} onChange={e => updatePresentacion(p.id, "precio", parseFloat(e.target.value) || 0)} />
                    </div>
                    <button type="button" onClick={() => removePresentacion(p.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      style={{ color: "var(--color-danger)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: "var(--color-border)" }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">
              {producto ? "Guardar cambios" : "Crear producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Productos() {
  const { productos, loading, refetch } = useProductos();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [estadoFilter, setEstadoFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | undefined>();
  const [viewPres, setViewPres] = useState<Producto | undefined>();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size={32} />
      </div>
    );
  }

  const filtered = productos.filter(p => {
    const matchSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.codigo.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || p.categoria === catFilter;
    const matchEst = estadoFilter === "all" || p.estado === estadoFilter;
    return matchSearch && matchCat && matchEst;
  });

  const handleSave = async (form: ProductoForm) => {
    try {
      if (editingProduct) {
        await productosService.update(editingProduct.id, form);
      } else {
        await productosService.create(form);
      }
      await refetch();
    } catch (e: any) {
      alert(e.message ?? "Error al guardar");
    }
    setShowModal(false);
    setEditingProduct(undefined);
  };

  const toggleEstado = async (id: string) => {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;
    try {
      await productosService.update(id, { estado: prod.estado === "Activo" ? "Inactivo" : "Activo" });
      await refetch();
    } catch (e: any) {
      alert(e.message ?? "Error al cambiar estado");
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Productos</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>{productos.length} productos registrados</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingProduct(undefined); setShowModal(true); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo producto
        </button>
      </div>

      {/* Filters */}
      <div className="card !p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <svg width="15" height="15" className="absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="input-field pl-9 text-sm" placeholder="Buscar por nombre o código..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select-field w-auto text-sm" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">Todas las categorías</option>
          {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="select-field w-auto text-sm" value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)}>
          <option value="all">Todos los estados</option>
          <option>Activo</option>
          <option>Inactivo</option>
        </select>
        {(search || catFilter !== "all" || estadoFilter !== "all") && (
          <button className="btn-secondary text-sm py-2" onClick={() => { setSearch(""); setCatFilter("all"); setEstadoFilter("all"); }}>
            Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-container" style={{ background: "white" }}>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Unidad</th>
              <th>Presentaciones</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12" style={{ color: "var(--color-muted)" }}>
                No se encontraron productos
              </td></tr>
            )}
            {filtered.map(p => (
              <tr key={p.id} className="table-row-hover">
                <td><code>{p.codigo}</code></td>
                <td>
                  <div className="font-medium text-sm">{p.nombre}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{p.descripcion.slice(0, 50)}{p.descripcion.length > 50 ? "..." : ""}</div>
                </td>
                <td>{catBadge(p.categoria)}</td>
                <td className="text-sm">{p.unidadPrincipal}</td>
                <td>
                  <button onClick={() => setViewPres(p)}
                    className="text-sm font-medium flex items-center gap-1 hover:underline"
                    style={{ color: "var(--color-primary)" }}>
                    {p.presentaciones.length} presentacion{p.presentaciones.length !== 1 ? "es" : ""}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </td>
                <td>
                  <span className={`badge ${p.estado === "Activo" ? "badge-success" : "badge-neutral"}`}>{p.estado}</span>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingProduct(p); setShowModal(true); }}
                      className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" style={{ color: "var(--color-primary)" }}
                      title="Editar">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button onClick={() => toggleEstado(p.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" style={{ color: "var(--color-muted)" }}
                      title={p.estado === "Activo" ? "Desactivar" : "Activar"}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
                        <circle cx={p.estado === "Activo" ? "16" : "8"} cy="12" r="3" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ProductoModal producto={editingProduct} onClose={() => { setShowModal(false); setEditingProduct(undefined); }} onSave={handleSave} />
      )}
      {viewPres && (
        <PresentacionesModal producto={viewPres} onClose={() => setViewPres(undefined)} />
      )}
    </div>
  );
}
