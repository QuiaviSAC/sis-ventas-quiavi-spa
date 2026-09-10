import { useAuth } from "../context/AuthContext";

export default function Configuracion() {
  const { user } = useAuth();
  const email = user?.email || "";
  const initials = email ? email.substring(0, 2).toUpperCase() : "MX";

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold">Configuracion</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>Ajustes del sistema y del negocio</p>
      </div>

      <div className="card">
        <div className="font-semibold text-sm mb-5">Perfil de usuario</div>
        <div className="flex items-center gap-4 mb-5">
          <div style={{ background: "var(--color-accent)" }}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {initials}
          </div>
          <div>
            <div className="font-semibold">{email || "Usuario"}</div>
            <div className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>{email}</div>
            <span className="badge badge-primary mt-1">Activo</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Correo electronico</label>
            <input className="input-field" type="email" value={email} disabled />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="font-semibold text-sm mb-5">Datos del negocio</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Nombre del negocio", value: "Motorix SAC" },
            { label: "RUC", value: "20512345678" },
            { label: "Direccion", value: "Lima, Peru" },
            { label: "Telefono", value: "+51 999 999 999" },
          ].map((f, i) => (
            <div key={i}>
              <label className="label">{f.label}</label>
              <input className="input-field" defaultValue={f.value} />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button className="btn-primary" onClick={() => alert("Datos guardados")}>Guardar</button>
        </div>
      </div>

      <div className="card">
        <div className="font-semibold text-sm mb-5">Preferencias del sistema</div>
        <div className="flex flex-col gap-4">
          {[
            { label: "Moneda", desc: "Moneda usada en todas las transacciones", value: "Soles (S/)" },
            { label: "Zona horaria", desc: "Zona horaria para fechas y horas", value: "America/Lima (UTC-5)" },
          ].map((pref, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "#F1F5F9" }}>
              <div>
                <div className="font-medium text-sm">{pref.label}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{pref.desc}</div>
              </div>
              <select className="select-field w-auto text-sm">
                <option>{pref.value}</option>
              </select>
            </div>
          ))}
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-sm">Alertas de stock bajo</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>Notificar cuando el stock baje del minimo</div>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: "var(--color-primary)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
