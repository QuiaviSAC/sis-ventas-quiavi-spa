import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { rolesService } from "../services/roles.service";
import type { Rol } from "../types";
import MotorixLogo from "../components/ui/MotorixLogo";
import AutomotiveShowcase from "../components/auth/AutomotiveShowcase";

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [roles, setRoles] = useState<Rol[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    idRol: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    rolesService
      .getAll()
      .then((data) => {
        setRoles(data);
        if (data.length > 0) {
          setForm((prev) => ({ ...prev, idRol: data[0].id }));
        }
      })
      .catch((err) => console.error("Error al cargar roles:", err))
      .finally(() => setLoadingRoles(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generateInternalUsername = (nombre: string, apellidos: string) => {
    const clean = (txt: string) =>
      txt
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");

    const cNombre = clean(nombre.trim().split(" ")[0] || "");
    const cApellido = clean(apellidos.trim().split(" ")[0] || "");
    const randomSuffix = Math.random().toString(36).substring(2, 8);

    if (cNombre || cApellido) {
      return cNombre + cApellido + randomSuffix;
    }
    return "usr" + randomSuffix;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const internalUserName = generateInternalUsername(form.nombre, form.apellidos);

    setLoading(true);
    try {
      await signUp({
        email: form.email,
        password: form.password,
        userName: internalUserName,
        nombre: form.nombre,
        apellidos: form.apellidos,
        idRol: form.idRol || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/app/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err.message ?? "Error al registrar la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white overflow-x-hidden">
      {/* PANEL IZQUIERDO: REGISTRO MOTORIX (100% en movil, ~40-42% en desktop) */}
      <div className="w-full lg:w-[42%] xl:w-[40%] min-h-screen flex flex-col justify-between p-6 sm:p-10 xl:p-14 bg-white z-10">
        {/* Cabecera / Logo */}
        <div className="flex items-center justify-between">
          <MotorixLogo size="md" />
          <span className="hidden sm:inline-block text-[11px] font-mono text-[#808080] border border-[#BFBFBF] px-2.5 py-1 rounded-md">
            NEW OPERATOR
          </span>
        </div>

        {/* Bloque Central de Registro */}
        <div className="w-full max-w-[440px] mx-auto my-auto py-6 sm:py-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-[#1E1E1E] tracking-tight">
              Alta de Personal
            </h1>
            <p className="text-sm text-[#595959] mt-1.5 font-normal leading-relaxed">
              Registra tu perfil en Motorix para operar en el taller, inventario y facturación.
            </p>
          </div>

          {success && (
            <div
              className="mb-4 p-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 shadow-xs"
              style={{ backgroundColor: "#E8F5E9", color: "#2E7D32", border: "1px solid #C8E6C9" }}
            >
              <span className="font-bold text-base">✓</span>
              <span>Cuenta creada con éxito. Redirigiendo al sistema...</span>
            </div>
          )}

          {error && (
            <div
              className="mb-4 p-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 shadow-xs"
              style={{ backgroundColor: "#FFEBEE", color: "#D32F2F", border: "1px solid #FFCDD2" }}
            >
              <span className="font-bold text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-4">
            {/* Nombres y Apellidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">
                  Nombres
                </label>
                <input
                  type="text"
                  name="nombre"
                  className="input-field text-sm text-[#1E1E1E] h-[44px]"
                  placeholder="Carlos"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="label">
                  Apellidos
                </label>
                <input
                  type="text"
                  name="apellidos"
                  className="input-field text-sm text-[#1E1E1E] h-[44px]"
                  placeholder="Ruiz"
                  value={form.apellidos}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Rol Operativo y Correo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">
                  Rol Asignado
                </label>
                <select
                  name="idRol"
                  className="select-field text-sm text-[#1E1E1E] h-[44px]"
                  value={form.idRol}
                  onChange={handleChange}
                  disabled={loadingRoles}
                >
                  {roles.length === 0 ? (
                    <option value="">{loadingRoles ? "Cargando..." : "Sin roles"}</option>
                  ) : (
                    roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre + (r.code ? " (" + r.code + ")" : "")}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="label">
                  Correo Corporativo
                </label>
                <input
                  type="email"
                  name="email"
                  className="input-field text-sm text-[#1E1E1E] h-[44px]"
                  placeholder="carlos@motorix.pe"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="label">
                Contraseña de Acceso
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  className="input-field pr-11 text-sm text-[#1E1E1E] h-[44px]"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#808080] hover:text-[#1E1E1E] transition-colors p-1"
                >
                  {showPass ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="label">
                Confirmar Contraseña
              </label>
              <input
                type={showPass ? "text" : "password"}
                name="confirmPassword"
                className="input-field text-sm text-[#1E1E1E] h-[44px]"
                placeholder="Repite la contraseña"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* Botón de Confirmación */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary justify-center h-[48px] text-sm uppercase tracking-wider mt-2 w-full shadow-md"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Confirmar y Crear Cuenta</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-[#E8E8E8] text-xs text-[#595959]">
          <div>
            ¿Ya eres usuario del sistema?{" "}
            <Link to="/" className="font-bold text-[#3D3D3D] hover:text-[#D32F2F] transition-colors underline">
              Iniciar sesión aquí
            </Link>
          </div>
          <span className="text-[11px] font-mono text-[#A3A3A3]">
            MOTORIX © 2026
          </span>
        </div>
      </div>

      {/* PANEL DERECHO: SHOWCASE AUTOMOTRIZ */}
      <AutomotiveShowcase />
    </div>
  );
}
