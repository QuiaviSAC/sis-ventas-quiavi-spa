import { useState } from "react";
import { useVentas } from "../hooks/useVentas";
import { useProductos } from "../hooks/useProductos";
import { ventasService } from "../services/ventas.service";
import type { Venta, LineaVenta, Producto } from "../types";
import Spinner from "../components/ui/Spinner";

function estadoBadge(estado: string) {
  const m: Record<string, string> = { Completada: "badge-success", Pendiente: "badge-warning", Anulada: "badge-danger" };
  return <span className={"badge " + (m[estado] || "badge-neutral")}>{estado}</span>;
}

function DetalleModal({ venta, onClose, onAnular, productos }: {
  venta: Venta;
  onClose: () => void;
  onAnular: () => void;
  productos: Producto[];
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
          <div>
            <div className="font-semibold">Venta #{venta.numero}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{venta.fecha}</div>
          </div>
          <div className="flex items-center gap-3">
            {estadoBadge(venta.estado)}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div><div className="label">Cliente</div><div className="font-medium text-sm">{venta.cliente || "Anonimo"}</div></div>
            <div><div className="label">Atendido por</div><div className="font-medium text-sm">{venta.usuario}</div></div>
          </div>

          <div className="label mb-3">Productos vendidos</div>
          <div className="table-container mb-4">
            <table>
              <thead>
                <tr><th>Producto</th><th>Presentacion</th><th>Cant.</th><th>P. Unit.</th><th>Total</th></tr>
              </thead>
              <tbody>
                {venta.lineas.map((l, idx) => {
                  const prod = productos.find(p => p.id === l.productoId);
                  const pres = prod?.presentaciones.find(pr => pr.id === l.presentacionId);
                  return (
                    <tr key={l.id || idx}>
                      <td className="font-medium text-sm">{prod?.nombre || "Producto"}</td>
                      <td className="text-sm" style={{ color: "var(--color-muted)" }}>{pres?.nombre || "-"}</td>
                      <td className="font-mono text-sm">{l.cantidad}</td>
                      <td className="font-mono text-sm">S/ {l.precioUnitario.toFixed(2)}</td>
                      <td className="font-mono font-semibold text-sm">S/ {(l.cantidad * l.precioUnitario).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-1 text-sm border-t pt-3" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span><span className="font-mono">S/ {venta.subtotal.toFixed(2)}</span>
            </div>
            {venta.descuento > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Descuento</span><span className="font-mono">- S/ {venta.descuento.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base mt-1 pt-1 border-t" style={{ borderColor: "var(--color-border)" }}>
              <span>Total</span>
              <span className="font-mono text-blue-600">S/ {venta.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 rounded-b-2xl"
          style={{ borderColor: "var(--color-border)" }}>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => window.print()}>
              Imprimir
            </button>
          </div>
          {venta.estado !== "Anulada" && (
            <button className="btn-danger text-sm py-1.5 px-3" onClick={onAnular}>Anular venta</button>
          )}
        </div>
      </div>
    </div>
  );
}

interface LineaForm { productoId: string; presentacionId: string; cantidad: number; }

function NuevaVentaModal({ onClose, onSave, productos }: {
  onClose: () => void;
  onSave: (v: Omit<Venta, "id" | "numero">) => void;
  productos: Producto[];
}) {
  const activosConPresentaciones = productos.filter(p => p.estado === "Activo" && p.presentaciones.length > 0);
  const [cliente, setCliente] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [lineas, setLineas] = useState<LineaForm[]>([
    {
      productoId: activosConPresentaciones[0]?.id || "",
      presentacionId: activosConPresentaciones[0]?.presentaciones[0]?.id || "",
      cantidad: 1,
    },
  ]);

  const addLinea = () => {
    const prod = activosConPresentaciones[0];
    setLineas(l => [...l, { productoId: prod?.id || "", presentacionId: prod?.presentaciones[0]?.id || "", cantidad: 1 }]);
  };

  const removeLinea = (i: number) => setLineas(l => l.filter((_, idx) => idx !== i));

  const updateLinea = (i: number, field: keyof LineaForm, value: string | number) => {
    setLineas(l => l.map((item, idx) => {
      if (idx !== i) return item;
      if (field === "productoId") {
        const prod = productos.find(p => p.id === value);
        return { ...item, productoId: value as string, presentacionId: prod?.presentaciones[0]?.id || "" };
      }
      return { ...item, [field]: value };
    }));
  };

  const lineasConPrecio = lineas.map(l => {
    const prod = productos.find(p => p.id === l.productoId);
    const pres = prod?.presentaciones.find(pr => pr.id === l.presentacionId);
    return { ...l, precio: pres?.precio || 0, total: (pres?.precio || 0) * l.cantidad };
  });

  const subtotal = lineasConPrecio.reduce((s, l) => s + l.total, 0);
  const total = Math.max(0, subtotal - descuento);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      cliente: cliente || "Anonimo",
      fecha: new Date().toISOString(),
      usuario: "Usuario",
      lineas: lineasConPrecio.map((l, i) => ({
        id: l_,
        productoId: l.productoId,
        presentacionId: l.presentacionId,
        cantidad: l.cantidad,
        precioUnitario: l.precio,
      })),
      subtotal,
      descuento,
      total,
      estado: "Completada",
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="font-semibold">Nueva venta</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 flex flex-col gap-4">
            <div>
              <label className="label">Cliente</label>
              <input className="input-field" placeholder="Nombre o razon social"
                value={cliente} onChange={e => setCliente(e.target.value)} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Productos</label>
                <button type="button" className="text-xs font-semibold text-blue-600 hover:underline" onClick={addLinea}>
                  + Agregar producto
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {lineas.map((l, i) => {
                  const prod = productos.find(p => p.id === l.productoId);
                  const presentaciones = prod?.presentaciones.filter(pr => pr.activa) || [];
                  const pres = presentaciones.find(pr => pr.id === l.presentacionId);
                  const linTotal = (pres?.precio || 0) * l.cantidad;

                  return (
                    <div key={i} className="flex gap-2 items-center p-3 rounded-lg border bg-gray-50" style={{ borderColor: "var(--color-border)" }}>
                      <select className="select-field text-sm flex-1" value={l.productoId}
                        onChange={e => updateLinea(i, "productoId", e.target.value)}>
                        {activosConPresentaciones.map(p => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>

                      <select className="select-field text-sm w-36" value={l.presentacionId}
                        onChange={e => updateLinea(i, "presentacionId", e.target.value)}>
                        {presentaciones.map(pr => (
                          <option key={pr.id} value={pr.id}>{pr.nombre} (S/ {pr.precio})</option>
                        ))}
                      </select>

                      <input type="number" min="1" className="input-field text-sm w-16 text-center"
                        value={l.cantidad} onChange={e => updateLinea(i, "cantidad", parseInt(e.target.value) || 1)} />

                      <div className="font-mono font-bold text-sm w-20 text-right shrink-0">
                        S/ {linTotal.toFixed(2)}
                      </div>

                      {lineas.length > 1 && (
                        <button type="button" onClick={() => removeLinea(i)} className="text-gray-400 hover:text-red-500 p-1">
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Descuento (S/)</label>
                <input type="number" min="0" step="0.5" className="input-field"
                  value={descuento} onChange={e => setDescuento(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="flex flex-col justify-end text-right">
                <span className="text-xs text-gray-500">Total a pagar</span>
                <span className="font-mono font-bold text-2xl text-blue-600">S/ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl"
            style={{ borderColor: "var(--color-border)" }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Completar venta</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Ventas() {
  const { productos, loading: loadP } = useProductos();
  const { ventas, loading: loadV, refetch } = useVentas();
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("all");
  const [showNueva, setShowNueva] = useState(false);
  const [detalleVenta, setDetalleVenta] = useState<Venta | undefined>();

  if (loadP || loadV) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size={32} />
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const ventasHoy = ventas.filter(v => v.fecha.startsWith(today) && v.estado !== "Anulada");
  const montoDia = ventasHoy.reduce((s, v) => s + v.total, 0);
  const montoMes = ventas.filter(v => v.estado !== "Anulada").reduce((s, v) => s + v.total, 0);
  const numVentas = ventasHoy.length;
  const ticket = numVentas > 0 ? montoDia / numVentas : 0;

  const filtered = ventas.filter(v => {
    const prod = v.lineas[0] ? productos.find(p => p.id === v.lineas[0].productoId) : null;
    const matchSearch = !search || v.numero.includes(search) || v.cliente.toLowerCase().includes(search.toLowerCase()) || (prod?.nombre.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchEst = estadoFilter === "all" || v.estado === estadoFilter;
    return matchSearch && matchEst;
  });

  const handleSave = async (data: Omit<Venta, "id" | "numero">) => {
    try {
      await ventasService.create(data);
      await refetch();
    } catch (e: any) {
      alert(e.message ?? "Error registrando venta");
    }
  };

  const handleAnular = async (id: string) => {
    alert("Operacion no soportada aun directamente en BD");
    setDetalleVenta(undefined);
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Ventas</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>Registro y gestion de transacciones comerciales</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNueva(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva venta
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Ventas del dia", val: "S/ " + montoDia.toFixed(2), sub: numVentas + " transacciones", accent: true },
          { label: "Ventas del mes", val: "S/ " + montoMes.toFixed(2) },
          { label: "Ticket promedio", val: "S/ " + ticket.toFixed(2) },
          { label: "Total transacciones", val: ventas.length },
        ].map((k, i) => (
          <div key={i} className="kpi-card">
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>{k.label}</div>
            <div className="text-2xl font-bold mt-1" style={{ color: k.accent ? "var(--color-accent)" : "var(--color-text)" }}>{k.val}</div>
            {k.sub && <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      <div className="card !p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <svg width="15" height="15" className="absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="input-field pl-9 text-sm" placeholder="Buscar por cliente, numero de venta..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select-field w-auto text-sm" value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)}>
          <option value="all">Todos los estados</option>
          <option value="Completada">Completada</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Anulada">Anulada</option>
        </select>
      </div>

      <div className="table-container bg-white">
        <table>
          <thead>
            <tr>
              <th>Nro.</th>
              <th>Fecha y hora</th>
              <th>Cliente</th>
              <th>Items</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No se encontraron ventas</td></tr>
            ) : filtered.map(v => (
              <tr key={v.id} className="table-row-hover">
                <td><code>#{v.numero}</code></td>
                <td className="text-sm" style={{ color: "var(--color-muted)" }}>{v.fecha}</td>
                <td className="font-medium text-sm">{v.cliente || "Anonimo"}</td>
                <td className="text-sm">{v.lineas.length} producto(s)</td>
                <td className="font-mono font-bold text-sm">S/ {v.total.toFixed(2)}</td>
                <td>{estadoBadge(v.estado)}</td>
                <td>
                  <button className="btn-secondary py-1 px-2.5 text-xs" onClick={() => setDetalleVenta(v)}>
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detalleVenta && (
        <DetalleModal
          venta={detalleVenta}
          productos={productos}
          onClose={() => setDetalleVenta(undefined)}
          onAnular={() => handleAnular(detalleVenta.id)}
        />
      )}

      {showNueva && (
        <NuevaVentaModal
          productos={productos}
          onClose={() => setShowNueva(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
