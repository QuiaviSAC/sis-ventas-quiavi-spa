import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useProductos } from "../hooks/useProductos";
import { useInventario } from "../hooks/useInventario";
import { useVentas } from "../hooks/useVentas";
import Spinner from "../components/ui/Spinner";

function KpiCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="kpi-card">
      <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>{label}</div>
      <div className="text-2xl font-bold mt-1" style={{ color: accent ? "var(--color-accent)" : "var(--color-text)" }}>{value}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{sub}</div>}
    </div>
  );
}

function estadoBadge(estado: string) {
  const m: Record<string, string> = {
    Completada: "badge-success", Pendiente: "badge-warning", Anulada: "badge-danger",
  };
  return <span className={"badge " + (m[estado] || "badge-neutral")}>{estado}</span>;
}

export default function Dashboard() {
  const { productos, loading: loadP } = useProductos();
  const { inventario, loading: loadI } = useInventario();
  const { ventas, loading: loadV } = useVentas();

  if (loadP || loadI || loadV) {
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
  const stockBajo = inventario.filter(i => i.stockActual <= i.stockMinimo);
  const activos = productos.filter(p => p.estado === "Activo");
  const stockTotal = inventario.reduce((s, i) => s + i.stockActual, 0);
  const recientes = [...ventas].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 6);

  const days = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
  const ventasSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const monto = ventas
      .filter(v => v.fecha.startsWith(key) && v.estado !== "Anulada")
      .reduce((s, v) => s + v.total, 0);
    return { dia: days[d.getDay()], monto };
  });

  const productoMap: Record<string, { nombre: string; cantidad: number; total: number }> = {};
  ventas
    .filter(v => v.estado !== "Anulada")
    .forEach(v => {
      v.lineas.forEach(l => {
        const prod = productos.find(p => p.id === l.productoId);
        if (!prod) return;
        if (!productoMap[l.productoId]) productoMap[l.productoId] = { nombre: prod.nombre, cantidad: 0, total: 0 };
        productoMap[l.productoId].cantidad += l.cantidad;
        productoMap[l.productoId].total += l.cantidad * l.precioUnitario;
      });
    });
  const topProductos = Object.values(productoMap).sort((a, b) => b.total - a.total).slice(0, 5);

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard label="Productos registrados" value={productos.length} />
        <KpiCard label="Stock total" value={stockTotal} sub="unidades fisicas" />
        <KpiCard label="Ventas del dia" value={"S/ " + montoDia.toFixed(2)} accent />
        <KpiCard label="Ventas del mes" value={"S/ " + montoMes.toFixed(2)} />
        <KpiCard label="Stock bajo" value={stockBajo.length} sub="requieren reposicion" />
        <KpiCard label="Productos activos" value={activos.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-sm">Ventas - ultimos 7 dias</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>Monto vendido por dia (S/)</div>
            </div>
            <div className="badge badge-primary">Esta semana</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ventasSemana} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} tickFormatter={v => "S/" + v} />
              <Tooltip formatter={(v) => ["S/ " + v, "Monto"]} contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13 }} cursor={{ fill: "#F1F5F9" }} />
              <Bar dataKey="monto" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="font-semibold text-sm mb-4">Productos mas vendidos</div>
          {topProductos.length === 0
            ? <p className="text-sm" style={{ color: "var(--color-muted)" }}>Sin datos de ventas aun</p>
            : (
              <div className="flex flex-col gap-3">
                {topProductos.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: i === 0 ? "var(--color-accent-light)" : "var(--color-neutral-light)", color: i === 0 ? "#92400E" : "var(--color-muted)" }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.nombre}</div>
                      <div className="text-xs" style={{ color: "var(--color-muted)" }}>{p.cantidad} uds · S/ {p.total.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span className="font-semibold text-sm">Alertas de inventario</span>
            <span className="badge badge-warning ml-auto">{stockBajo.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {stockBajo.length === 0
              ? <p className="text-sm" style={{ color: "var(--color-muted)" }}>Sin alertas activas</p>
              : stockBajo.map(item => {
                  const prod = productos.find(p => p.id === item.productoId);
                  return (
                    <div key={item.productoId} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "#F1F5F9" }}>
                      <div>
                        <div className="text-sm font-medium">{prod?.nombre ?? item.productoId}</div>
                        <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                          Stock: {item.stockActual} · Min: {item.stockMinimo}
                        </div>
                      </div>
                      <span className="badge badge-warning shrink-0">Bajo</span>
                    </div>
                  );
                })
            }
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-sm">Actividad reciente</span>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Venta</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recientes.map(v => (
                  <tr key={v.id} className="table-row-hover">
                    <td><code>#{v.numero}</code></td>
                    <td className="text-sm font-medium">{v.cliente}</td>
                    <td className="font-semibold font-mono text-sm">S/ {v.total.toFixed(2)}</td>
                    <td>{estadoBadge(v.estado)}</td>
                    <td className="text-sm" style={{ color: "var(--color-muted)" }}>{v.fecha.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
