import { createBrowserRouter, Navigate } from "react-router";
import type { ReactNode } from "react";
import { useAuth } from "./context/AuthContext";
import Spinner from "./components/ui/Spinner";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Inventario from "./pages/Inventario";
import Ventas from "./pages/Ventas";
import Reportes from "./pages/Reportes";
import Usuarios from "./pages/Usuarios";
import Configuracion from "./pages/Configuracion";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }
  if (!session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }
  if (session) return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicRoute><Login /></PublicRoute>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/registro",
    element: <PublicRoute><Register /></PublicRoute>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/app",
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "productos", element: <Productos /> },
      { path: "inventario", element: <Inventario /> },
      { path: "ventas", element: <Ventas /> },
      { path: "reportes", element: <Reportes /> },
      { path: "usuarios", element: <Usuarios /> },
      { path: "configuracion", element: <Configuracion /> },
    ],
  },
]);
