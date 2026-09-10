import { useState } from "react";
import { useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

const BREADCRUMBS: Record<string, string[]> = {
  "/app/dashboard":     ["Inicio", "Dashboard"],
  "/app/productos":     ["Inicio", "Productos"],
  "/app/categorias":    ["Inicio", "Productos", "Categorías"],
  "/app/unidades":      ["Inicio", "Productos", "Unidades de Medida"],
  "/app/inventario":    ["Inicio", "Inventario"],
  "/app/ventas":        ["Inicio", "Ventas"],
  "/app/reportes":      ["Inicio", "Reportes"],
  "/app/usuarios":      ["Inicio", "Usuarios"],
  "/app/configuracion": ["Inicio", "Configuracion"],
};

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const { user } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const crumbs = BREADCRUMBS[location.pathname] || ["Inicio"];
  const email = user?.email ?? "";
  const initials = email ? email.substring(0, 2).toUpperCase() : "MX";

  return (
    <header
      style={{ background: "white", borderBottom: "1px solid var(--color-border)" }}
      className="h-14 flex items-center px-5 gap-4 shrink-0"
    >
      <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <nav className="flex items-center gap-2 flex-1 min-w-0">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span style={{ color: "var(--color-border)" }}>/</span>}
            <span
              style={{ color: i === crumbs.length - 1 ? "var(--color-text)" : "var(--color-muted)" }}
              className={"text-sm " + (i === crumbs.length - 1 ? "font-semibold" : "")}
            >
              {c}
            </span>
          </span>
        ))}
      </nav>

      <div
        className="hidden md:flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2"
        style={{ borderColor: "var(--color-border)" }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input placeholder="Buscar..." className="bg-transparent text-sm outline-none w-48" style={{ color: "var(--color-text)" }} />
      </div>

      <div className="relative">
        <button
          onClick={() => setShowNotif(!showNotif)}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2 cursor-pointer select-none">
        <div
          style={{ background: "var(--color-accent)" }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
        >
          {initials}
        </div>
        <div className="hidden md:block">
          <div className="text-sm font-medium leading-tight truncate max-w-[140px]">{email}</div>
          <div className="text-xs" style={{ color: "var(--color-muted)" }}>Usuario</div>
        </div>
      </div>
    </header>
  );
}
