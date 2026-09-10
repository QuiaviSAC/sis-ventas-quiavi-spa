import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import MotorixLogo from "../components/ui/MotorixLogo";
import AutomotiveShowcase from "../components/auth/AutomotiveShowcase";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, pass);
      navigate("/app/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Credenciales de acceso no válidas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white overflow-x-hidden">
      {/* PANEL IZQUIERDO: FORMULARIO MOTORIX (Ocupa 100% en movil, ~40-42% en desktop con scroll suave si es necesario) */}
      <div className="w-full lg:w-[42%] xl:w-[40%] min-h-screen flex flex-col justify-between p-6 sm:p-10 xl:p-14 bg-white z-10">
        {/* Cabecera / Logo */}
        <div className="flex items-center justify-between">
          <MotorixLogo size="md" />
          <span className="hidden sm:inline-block text-[11px] font-mono text-[#808080] border border-[#BFBFBF] px-2.5 py-1 rounded-md">
            v2.4 SECURE
          </span>
        </div>

        {/* Bloque Central de Login */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-8 sm:py-10">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-[#1E1E1E] tracking-tight">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-[#595959] mt-1.5 font-normal leading-relaxed">
              Bienvenido a Motorix. Ingresa tus credenciales técnicas para acceder al panel operativo.
            </p>
          </div>

          {error && (
            <div
              className="mb-5 p-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 shadow-xs"
              style={{ backgroundColor: "#FFEBEE", color: "#D32F2F", border: "1px solid #FFCDD2" }}
            >
              <span className="font-bold text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
            {/* Campo Correo */}
            <div>
              <label className="label">
                Correo Electrónico
              </label>

              <div className="relative">
                

                <input
                  type="email"
                  className="input-field pl-[40px] pr-[40px] text-sm text-[#1E1E1E] h-[46px]"
                  placeholder="usuario@motorix.pe"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="label">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="input-field pl-[40rem] pr-[4rem] text-sm text-[#1E1E1E] h-[46px]"
                  placeholder="••••••••"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#808080] hover:text-[#1E1E1E] transition-colors p-1"
                >
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Recordar y Olvido */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#595959] select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-[#BFBFBF]"
                  style={{ accentColor: "#3D3D3D" }}
                />
                <span>Recordar credenciales</span>
              </label>
              <a
                href="#recuperar"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Para restablecer contraseña, comunícate con el Administrador de Motorix.");
                }}
                className="font-semibold text-[#595959] hover:text-[#D32F2F] transition-colors"
              >
                ¿Olvidaste tu clave?
              </a>
            </div>

            {/* Botón Acceder */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary justify-center h-[48px] text-sm uppercase tracking-wider mt-2 w-full shadow-md"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Acceder al Sistema</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-[#E8E8E8] text-xs text-[#595959]">
          <div>
            ¿No tienes cuenta activa?{" "}
            <Link to="/registro" className="font-bold text-[#3D3D3D] hover:text-[#D32F2F] transition-colors underline">
              Registrar nuevo usuario
            </Link>
          </div>
          <span className="text-[11px] font-mono text-[#A3A3A3]">
            MOTORIX © 2026
          </span>
        </div>
      </div>

      {/* PANEL DERECHO: SHOWCASE AUTOMOTRIZ (100% de alto y ancho proporcional en desktop) */}
      <AutomotiveShowcase />
    </div>
  );
}
