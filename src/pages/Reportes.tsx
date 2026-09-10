import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { useProductos } from "../hooks/useProductos";
import { useVentas } from "../hooks/useVentas";
import { useInventario } from "../hooks/useInventario";
import Spinner from "../components/ui/Spinner";

const CATEGORIA_COLORS = ["#2563EB","#F59E0B","#10B981","#EF4444","#8B5CF6","#06B6D4","#F97316","#64748B"];

export default function Reportes() {
  const { productos, loading: loadP } = useProductos();
  const { ventas, loading: loadV } = useVentas();
  const { inventario, loading: loadI } = useInventario();

  if (loadP || loadV || loadI) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size={32} />
      </div>
    );
  }

  const catDistribucion = Object.entries(
    productos.reduce<Record<string, number>>((acc, p) => {
      acc[p.categoria] = (acc[p.categoria] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const ventasCompletadas = ventas.filter(v => v.estado === "Completada");
  const totalMes = ventasCompletadas.reduce((s, v) => s + v.total, 0);
  const stockBajo = inventario.filter(i => i.stockActual <= i.stockMinimo).length;

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
      <div>
        <h1 className="text-xl font-bold">Reportes</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>Analisis y estadisticas del negocio</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total ventas (mes)", value: "S/ " + totalMes.toFixed(2) },
          { label: "Transacciones", value: ventasCompletadas.length },
          { label: "Productos activos", value: productos.filter(p => p.estado === "Activo").length },
          { label: "Alertas de stock", value: stockBajo, warn: true },
        ].map((k, i) => (
          <div key={i} className="kpi-card">
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>{k.label}</div>
            <div className="text-2xl font-bold mt-1" style={{ color: k.warn && (k.value as number) > 0 ? "var(--color-danger)" : "var(--color-text)" }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="font-semibold text-sm mb-1">Ventas por dia - esta semana</div>
          <div className="text-xs mb-4" style={{ color: "var(--color-muted)" }}>Monto total vendido en soles</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ventasSemana} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} tickFormatter={v => "S/" + v} />
              <Tooltip formatter={(v) => ["S/ " + v, "Monto"]} contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13 }} cursor={{ fill: "#F1F5F9" }} />
              <Bar dataKey="monto" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="font-semibold text-sm mb-1">Distribucion por categoria</div>
          <div className="text-xs mb-4" style={{ color: "var(--color-muted)" }}>Cantidad de productos por categoria</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={catDistribucion} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => name + " " + ((percent ?? 0) * 100).toFixed(0) + "%"} labelLine={false} fontSize={11}>
                {catDistribucion.map((_, i) => (
                  <Cell key={i} fill={CATEGORIA_COLORS[i % CATEGORIA_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card lg:col-span-2">
          <div className="font-semibold text-sm mb-4">Productos mas vendidos</div>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>#</th><th>Producto</th><th>Cantidad vendida</th><th>Total generado</th></tr>
              </thead>
              <tbody>
                {topProductos.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-6 text-gray-400">Sin datos registrados</td></tr>
                ) : topProductos.map((p, i) => (
                  <tr key={i} className="table-row-hover">
                    <td>
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold inline-flex"
                        style={{ background: i === 0 ? "var(--color-accent-light)" : "var(--color-neutral-light)", color: i === 0 ? "#92400E" : "var(--color-muted)" }}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="font-medium text-sm">{p.nombre}</td>
                    <td className="font-mono text-sm">{p.cantidad} unid.</td>
                    <td className="font-mono font-semibold text-sm">S/ {p.total.toFixed(2)}</td>
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
