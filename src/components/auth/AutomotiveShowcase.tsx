import React from "react";

export default function AutomotiveShowcase() {
  return (
    <div
      className="hidden lg:flex flex-col justify-between w-full lg:w-[58%] xl:w-[60%] p-10 xl:p-14 relative overflow-hidden text-white shrink-0 min-h-screen"
      style={{
        background: "linear-gradient(155deg, #2B2B2B 0%, #1E1E1E 100%)",
        borderLeft: "1px solid #3D3D3D",
      }}
    >
      {/* Patron de microtextura industrial */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#FFFFFF 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Resplandores metalicos sutiles en esquinas */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(191,191,191,0.1) 0%, rgba(0,0,0,0) 70%)",
        }}
      />
      <div
        className="absolute -bottom-28 -left-16 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(211,47,47,0.08) 0%, rgba(0,0,0,0) 70%)",
        }}
      />

      {/* Cabecera Superior del Showcase */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-[#595959] bg-[#2B2B2B]/80 text-xs font-mono text-[#A3A3A3] mb-5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#D32F2F] animate-pulse" />
          <span>MOTORIX WORKSHOP OS v2.4</span>
        </div>

        <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold leading-tight tracking-tight text-[#FFFFFF]">
          Control Integral de
          <br />
          <span className="text-[#BFBFBF]">Taller, Inventario</span>
          <br />
          <span className="text-[#FFFFFF]">y Ventas en Tiempo Real</span>
        </h2>

        <p className="text-sm xl:text-base mt-4 leading-relaxed text-[#A3A3A3] max-w-lg font-normal">
          Plataforma de alta precisión diseñada para la gestión técnica automotriz: órdenes de servicio, stock de repuestos, trazabilidad de componentes y facturación.
        </p>
      </div>

      {/* Visualizacion Central de Telemetría Industrial */}
      <div className="relative z-10 my-8 flex items-center justify-center">
        <div className="relative w-full max-w-[480px]">
          {/* Tarjeta Principal de Telemetria del Taller */}
          <div
            className="rounded-2xl p-6 border shadow-2xl text-white backdrop-blur-md"
            style={{
              background: "linear-gradient(180deg, rgba(61, 61, 61, 0.9) 0%, rgba(43, 43, 43, 0.95) 100%)",
              borderColor: "#595959",
            }}
          >
            {/* Header de telemetria */}
            <div className="flex items-center justify-between pb-4 border-b border-[#595959]">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded bg-[#D32F2F] shadow-sm" />
                <span className="text-sm font-bold font-mono tracking-wider text-[#FFFFFF]">
                  LIVE WORKSHOP METRICS
                </span>
              </div>
              <span className="text-xs font-mono text-[#A3A3A3] bg-[#1E1E1E] px-2.5 py-1 rounded-md border border-[#595959]">
                8 / 8 BAYS ACTIVE
              </span>
            </div>

            {/* Grid de metricas tecnicas */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="bg-[#1E1E1E] p-3.5 rounded-xl border border-[#3D3D3D]">
                <span className="text-[10px] uppercase font-mono text-[#A3A3A3] block">Órdenes Hoy</span>
                <span className="text-xl font-bold font-mono text-[#FFFFFF] mt-0.5 block">24</span>
                <span className="text-[10px] text-[#2E7D32] block font-mono mt-0.5">↑ 98% a tiempo</span>
              </div>
              <div className="bg-[#1E1E1E] p-3.5 rounded-xl border border-[#3D3D3D]">
                <span className="text-[10px] uppercase font-mono text-[#A3A3A3] block">Repuestos</span>
                <span className="text-xl font-bold font-mono text-[#FFFFFF] mt-0.5 block">1,420</span>
                <span className="text-[10px] text-[#A3A3A3] block font-mono mt-0.5">Stock auditado</span>
              </div>
              <div className="bg-[#1E1E1E] p-3.5 rounded-xl border border-[#3D3D3D]">
                <span className="text-[10px] uppercase font-mono text-[#A3A3A3] block">Eficiencia</span>
                <span className="text-xl font-bold font-mono text-[#D32F2F] mt-0.5 block">94.2%</span>
                <span className="text-[10px] text-[#A3A3A3] block font-mono mt-0.5">Calidad técnica</span>
              </div>
            </div>

            {/* Grafico de rendimiento semanal de bahias */}
            <div className="pt-2">
              <div className="flex justify-between items-center text-xs text-[#A3A3A3] font-mono mb-2">
                <span>Rendimiento Semanal (Servicios completados)</span>
                <span className="text-white font-bold">142 total</span>
              </div>
              <div className="h-20 flex items-end justify-between gap-2 pt-3 px-2 bg-[#1E1E1E] rounded-xl border border-[#3D3D3D]">
                {[
                  { day: "LUN", val: 55 },
                  { day: "MAR", val: 75 },
                  { day: "MIÉ", val: 95, active: true },
                  { day: "JUE", val: 80 },
                  { day: "VIE", val: 90 },
                  { day: "SÁB", val: 60 },
                  { day: "DOM", val: 30 },
                ].map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end gap-1.5">
                    <div
                      className="w-full rounded-t transition-all"
                      style={{
                        height: b.val + "%",
                        background: b.active
                          ? "linear-gradient(180deg, #D32F2F 0%, #B71C1C 100%)"
                          : "linear-gradient(180deg, #808080 0%, #595959 100%)",
                      }}
                    />
                    <span className="text-[9px] font-mono text-[#A3A3A3] pb-1">{b.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badge Flotante Superior: Diagnostico */}
          <div
            className="absolute -top-4 -right-4 rounded-xl px-4 py-2.5 border shadow-2xl flex items-center gap-3 backdrop-blur-md"
            style={{
              backgroundColor: "rgba(30, 30, 30, 0.95)",
              borderColor: "#595959",
            }}
          >
            <div className="w-8 h-8 rounded-full bg-[#2B2B2B] border border-[#A3A3A3] flex items-center justify-center text-sm shadow-inner">
              ⚙️
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-[#FFFFFF]">DIAGNÓSTICO OBD-II</div>
              <div className="text-[10px] font-mono text-[#2E7D32]">SISTEMAS OPERATIVOS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer del Showcase */}
      <div className="relative z-10 flex items-center justify-between pt-4 border-t border-[#3D3D3D] text-[#808080] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
          <span>MOTORIX CLOUD ENGINE</span>
        </div>
        <span>QUIAVI SAC • 2026</span>
      </div>
    </div>
  );
}
