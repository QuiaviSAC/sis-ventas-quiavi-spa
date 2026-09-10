import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import MotorixLogo from "../ui/MotorixLogo";

const NAV_ITEMS = [
  { path: "/app/dashboard",     label: "Dashboard",     icon: GridIcon },
  { path: "/app/productos",     label: "Productos",     icon: BoxIcon },
  { path: "/app/categorias",    label: "Categorías",    icon: TagIcon },
  { path: "/app/unidades",      label: "Unidades",      icon: ScaleIcon },
  { path: "/app/inventario",    label: "Inventario",    icon: WarehouseIcon },
  { path: "/app/ventas",        label: "Ventas",        icon: ShoppingIcon },
  { path: "/app/reportes",      label: "Reportes",      icon: ChartIcon },
  { path: "/app/usuarios",      label: "Usuarios",      icon: UsersIcon },
  { path: "/app/configuracion", label: "Configuracion", icon: SettingsIcon },
];

function TagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}
function WarehouseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function ShoppingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

interface SidebarProps {
  collapsed?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ collapsed = false, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const email = user?.email ?? "";
  const initials = email ? email.substring(0, 2).toUpperCase() : "MX";

  const handleNav = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <aside
      style={{ background: "var(--color-sidebar-bg)", width: collapsed ? "0" : "240px" }}
      className="flex flex-col h-full transition-all duration-300 overflow-hidden shrink-0"
    >
      <div className="flex items-center px-4 py-4 border-b" style={{ borderColor: "var(--color-sidebar-border)" }}>
        <MotorixLogo size="sm" light={true} />
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            className={"sidebar-item w-full text-left border-0 " + (location.pathname === path ? "active" : "")}
            onClick={() => handleNav(path)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t pt-4" style={{ borderColor: "var(--color-sidebar-border)" }}>
        <div className="flex items-center gap-3 px-3 mb-3">
          <div
            style={{ background: "var(--color-accent)", color: "white" }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-medium truncate">{email}</div>
            <div style={{ color: "var(--color-sidebar-text)", fontSize: 11 }}>Usuario</div>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-item w-full text-left border-0">
          <LogoutIcon />
          <span>Cerrar sesion</span>
        </button>
      </div>
    </aside>
  );
}
