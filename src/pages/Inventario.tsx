import { useState } from "react";
import { useInventario } from "../hooks/useInventario";
import { useProductos } from "../hooks/useProductos";
import { inventarioService } from "../services/inventario.service";
import type { MovimientoInventario, Producto } from "../types";
import Spinner from "../components/ui/Spinner";

const CATEGORIAS = ["Pinturas","Solventes","Lubricantes","Repuestos","Refacciones","Herramientas","Accesorios","Limpieza"];

function stockBadge(actual: number, minimo: number) {
  if (actual === 0) return <span className="badge badge-danger">Sin stock</span>;
  if (actual <= minimo) return <span className="badge badge-warning">Stock bajo</span>;
  return <span className="badge badge-success">Disponible</span>;
}

function tipoBadge(tipo: string) {
  const m: Record<string, string> = { Ingreso: "badge-success", Ajuste: "badge-warning", "Salida manual": "badge-neutral" };
  return <span className={"badge " + (m[tipo] || "badge-neutral")}>{tipo}</span>;
}

function IngresoModal({ onClose, onSave, productos }: {
  onClose: () => void;
  onSave: (mov: Omit<MovimientoInventario, "id">) => void;
  productos: Producto[];
}) {
  const [form, setForm] = useState({
    productoId: productos[0]?.id || "",
    cantidad: 1,
    tipo: "Ingreso" as "Ingreso" | "Ajuste" | "Salida manual",
    fecha: new Date().toISOString().slice(0, 10),
    proveedor: "",
    observacion: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      fecha: form.fecha + " " + new Date().toTimeString().slice(0,5),
      productoId: form.productoId,
      tipo: form.tipo,
      cantidad: form.tipo === "Ajuste" && form.cantidad > 0 ? -form.cantidad : form.cantidad,
      usuario: "Usuario",
      observacion: form.observacion || (form.tipo + " registrado"),
    });
    onClose();
  };

  const prod = productos.find(p => p.id === form.productoId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="font-semibold">Registrar movimiento</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 flex flex-col gap-4">
            <div>
              <label className="label">Tipo de movimiento</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Ingreso", "Ajuste", "Salida manual"] as const).map(t => (
                  <button key={t} type="button"
                    className={"py-2 px-3 rounded-lg text-sm font-medium border text-center transition-all " + (form.tipo === t ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold" : "border-gray-200 hover:bg-gray-50")}
                    onClick={() => setForm(f => ({ ...f, tipo: t }))}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Producto</label>
              <select className="select-field" value={form.productoId}
                onChange={e => setForm(f => ({ ...f, productoId: e.target.value }))}>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Cantidad ({prod?.unidadPrincipal || "unidades"})</label>
                <input type="number" min="1" className="input-field" value={form.cantidad}
                  onChange={e => setForm(f => ({ ...f, cantidad: parseInt(e.target.value) || 1 }))} required />
              </div>
              <div>
                <label className="label">Fecha</label>
                <input type="date" className="input-field" value={form.fecha}
                  onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} required />
              </div>
            </div>

            {form.tipo === "Ingreso" && (
              <div>
                <label className="label">Proveedor (opcional)</label>
                <input className="input-field" placeholder="Nombre del proveedor"
                  value={form.proveedor} onChange={e => setForm(f => ({ ...f, proveedor: e.target.value }))} />
              </div>
            )}

            <div>
              <label className="label">Observacion / Motivo</label>
              <textarea className="input-field" rows={2} placeholder="Ej: Compra segun factura F001-234"
                value={form.observacion} onChange={e => setForm(f => ({ ...f, observacion: e.target.value }))} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl"
            style={{ borderColor: "var(--color-border)" }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Registrar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Inventario() {
  const { productos, loading: loadP } = useProductos();
  const { inventario, movimientos, loading: loadI, refetch } = useInventario();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [estadoFilter, setEstadoFilter] = useState("all");
  const [sortField, setSortField] = useState<"stock" | "nombre" | "">("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  if (loadP || loadI) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size={32} />
      </div>
    );
  }

  const rows = inventario.map(i => {
    const prod = productos.find(p => p.id === i.productoId);
    return { ...i, prod };
  }).filter(r => r.prod);

  const filtered = rows.filter(r => {
    const prod = r.prod!;
    const matchSearch = !search || prod.nombre.toLowerCase().includes(search.toLowerCase()) || prod.codigo.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || prod.categoria === catFilter;
    const stockState = r.stockActual === 0 ? "Sin stock" : r.stockActual <= r.stockMinimo ? "Stock bajo" : "Disponible";
    const matchEst = estadoFilter === "all" || stockState === estadoFilter;
    return matchSearch && matchCat && matchEst;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    if (sortField === "stock") return sortDir === "asc" ? a.stockActual - b.stockActual : b.stockActual - a.stockActual;
    if (sortField === "nombre") return sortDir === "asc" ? a.prod!.nombre.localeCompare(b.prod!.nombre) : b.prod!.nombre.localeCompare(a.prod!.nombre);
    return 0;
  });

  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);

  const toggleSort = (field: "stock" | "nombre") => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const handleSaveMovimiento = async (mov: Omit<MovimientoInventario, "id">) => {
    try {
      await inventarioService.registrarMovimiento(mov);
      await refetch();
    } catch (e: any) {
      alert(e.message ?? "Error registrando movimiento");
    }
  };

  const recentMovs = movimientos.slice(0, 10).map(m => ({
    ...m, prod: productos.find(p => p.id === m.productoId),
  }));

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Inventario</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>Control de stock fisico de productos</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Registrar ingreso
        </button>
      </div>

      <div className="card !p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <svg width="15" height="15" className="absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="input-field pl-9 text-sm" placeholder="Buscar producto..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
        </div>
        <select className="select-field w-auto text-sm" value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(0); }}>
          <option value="all">Todas las categorias</option>
          {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="select-field w-auto text-sm" value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPage(0); }}>
          <option value="all">Todos los estados</option>
          <option value="Disponible">Disponible</option>
          <option value="Stock bajo">Stock bajo</option>
          <option value="Sin stock">Sin stock</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="table-container bg-white">
            <table>
              <thead>
                <tr>
                  <th className="cursor-pointer select-none" onClick={() => toggleSort("nombre")}>
                    Producto {sortField === "nombre" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                  </th>
                  <th>Categoria</th>
                  <th className="cursor-pointer select-none" onClick={() => toggleSort("stock")}>
                    Stock actual {sortField === "stock" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                  </th>
                  <th>Stock min.</th>
                  <th>Estado</th>
                  <th>Proveedor</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">No se encontraron productos</td></tr>
                ) : paged.map(r => (
                  <tr key={r.productoId} className="table-row-hover">
                    <td>
                      <div className="font-medium text-sm">{r.prod!.nombre}</div>
                      <div className="text-xs" style={{ color: "var(--color-muted)" }}>{r.prod!.codigo}</div>
                    </td>
                    <td><span className="badge badge-neutral">{r.prod!.categoria}</span></td>
                    <td className="font-mono font-bold text-sm">
                      {r.stockActual} <span className="font-normal text-xs text-gray-400">{r.prod!.unidadPrincipal}</span>
                    </td>
                    <td className="font-mono text-sm" style={{ color: "var(--color-muted)" }}>{r.stockMinimo}</td>
                    <td>{stockBadge(r.stockActual, r.stockMinimo)}</td>
                    <td className="text-sm" style={{ color: "var(--color-muted)" }}>{r.proveedor || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                Mostrando {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, sorted.length)} de {sorted.length}
              </span>
              <div className="flex gap-1">
                <button className="btn-secondary py-1 px-3 text-xs" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Anterior</button>
                <button className="btn-secondary py-1 px-3 text-xs" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Siguiente</button>
              </div>
            </div>
          )}
        </div>

        <div className="card h-fit">
          <div className="font-semibold text-sm mb-4">Ultimos movimientos</div>
          <div className="flex flex-col gap-3">
            {recentMovs.length === 0 ? (
              <p className="text-sm text-gray-400">Sin movimientos registrados</p>
            ) : recentMovs.map(m => (
              <div key={m.id} className="flex items-start justify-between py-2 border-b last:border-0 text-sm" style={{ borderColor: "#F1F5F9" }}>
                <div>
                  <div className="font-medium">{m.prod?.nombre || "Producto"}</div>
                  <div className="text-xs" style={{ color: "var(--color-muted)" }}>{m.fecha} · {m.usuario}</div>
                  {m.observacion && <div className="text-xs text-gray-400 mt-0.5">{m.observacion}</div>}
                </div>
                <div className="text-right shrink-0">
                  <div className={"font-mono font-bold " + (m.cantidad > 0 ? "text-green-600" : "text-red-600")}>
                    {m.cantidad > 0 ? ("+" + m.cantidad) : m.cantidad}
                  </div>
                  {tipoBadge(m.tipo)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <IngresoModal
          productos={productos}
          onClose={() => setShowModal(false)}
          onSave={handleSaveMovimiento}
        />
      )}
    </div>
  );
}
