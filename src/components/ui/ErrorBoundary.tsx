import { useRouteError, isRouteErrorResponse, Link } from "react-router";

export default function ErrorBoundary() {
  const error = useRouteError();

  let errorMessage = "Ocurrio un error inesperado.";
  if (isRouteErrorResponse(error)) {
    errorMessage = error.status + " " + error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--color-content-bg)" }}>
      <div className="card max-w-md w-full text-center p-8 flex flex-col items-center gap-4 shadow-lg">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-red-100 text-red-600 text-2xl font-bold">
          ⚠️
        </div>
        <div>
          <h2 className="text-xl font-bold mb-1">¡Ups! Algo salio mal</h2>
          <p className="text-sm text-gray-500">
            {errorMessage}
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary text-sm"
          >
            Reintentar
          </button>
          <Link to="/app/dashboard" className="btn-primary text-sm">
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
