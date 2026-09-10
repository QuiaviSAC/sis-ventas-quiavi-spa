import { useState, useEffect } from "react";
import { rolesService } from "../services/roles.service";
import { usuariosService } from "../services/usuarios.service";
import type { Rol, UsuarioData } from "../types";
import Spinner from "../components/ui/Spinner";

interface ModalUsuarioProps {
  roles: Rol[];
  onClose: () => void;
  onSave: (usuario: {
    id_rol: string;
    user_name: string;
    password: string;
    nombre: string;
    apellidos: string;
    correo: string;
  }) => Promise<void>;
}

function ModalNuevoUsuario({ roles, onClose, onSave }: ModalUsuarioProps) {
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    user_name: "",
    correo: "",
    id_rol: roles[0]?.id || "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [userEdited, setUserEdited] = useState(false);

  const generateSuffix = () => Math.random().toString(36).substring(2, 6);
  const sanitize = (txt: string) =>
    txt
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");

  const makeUsername = (nom: string, ape: string) => {
    const cNom = sanitize(nom.trim().split(" ")[0] || "");
    const cApe = sanitize(ape.trim().split(" ")[0] || "");
    if (!cNom && !cApe) return "";
    return `${cNom}${cApe}${generateSuffix()}`;
  };

  const handleNameChange = (field: "nombre" | "apellidos", val: string) => {
    const next = { ...form, [field]: val };
    if (!userEdited) {
      const u = makeUsername(
        field === "nombre" ? val : form.nombre,
        field === "apellidos" ? val : form.apellidos
      );
      if (u) next.user_name = u;
    }
    setForm(next);
  };

  const handleRegenerate = () => {
    const u = makeUsername(form.nombre, form.apellidos);
    if (u) setForm((prev) => ({ ...prev, user_name: u }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id_rol) {
      setError("Debes seleccionar un rol.");
      return;
    }
    if (form.password.length < 6) {
      setError("La contrasena debe tener minimo 6 caracteres.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Error al registrar el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="font-semibold text-lg">Registrar nuevo usuario</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 flex flex-col gap-4">
            {error && (
              <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Nombres</label>
                <input
                  className="input-field"
                  placeholder="Ej. Juan"
                  value={form.nombre}
                  onChange={(e) => handleNameChange("nombre", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Apellidos</label>
                <input
                  className="input-field"
                  placeholder="Ej. Perez"
                  value={form.apellidos}
                  onChange={(e) => handleNameChange("apellidos", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">Nombre de usuario</label>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    title="Regenerar sugerencia de usuario"
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                  >
                    <span>🔄</span>
                    <span>Sugerir</span>
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">
                    @
                  </span>
                  <input
                    className="input-field pl-7 font-mono text-sm"
                    placeholder="jperez3b9c"
                    value={form.user_name}
                    onChange={(e) => {
                      setUserEdited(true);
                      setForm({ ...form, user_name: e.target.value });
                    }}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Rol asignado</label>
                <select
                  className="select-field"
                  value={form.id_rol}
                  onChange={(e) => setForm({ ...form, id_rol: e.target.value })}
                  required
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}{r.code ? ` (${r.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Correo electronico</label>
              <input
                type="email"
                className="input-field"
                placeholder="juan.perez@motorix.pe"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Contrasena inicial</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl" style={{ borderColor: "var(--color-border)" }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Guardando..." : "Registrar usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioData[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [rolFilter, setRolFilter] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const [uList, rList] = await Promise.all([
        usuariosService.getAll(),
        rolesService.getAll(),
      ]);
      setUsuarios(uList);
      setRoles(rList);
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (data: any) => {
    await usuariosService.createUsuarioAdmin(data);
    await loadData();
  };

  const handleToggleEstado = async (u: UsuarioData) => {
    try {
      await usuariosService.toggleEstado(u.id, !u.estado);
      await loadData();
    } catch (err: any) {
      alert("Error al actualizar estado: " + err.message);
    }
  };

  const filtered = usuarios.filter((u) => {
    const matchSearch =
      !search ||
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(search.toLowerCase()) ||
      u.user_name.toLowerCase().includes(search.toLowerCase()) ||
      u.correo.toLowerCase().includes(search.toLowerCase());
    const matchRol = rolFilter === "all" || u.id_rol === rolFilter;
    return matchSearch && matchRol;
  });

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Usuarios y Accesos</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>
            Gestion de usuarios del personal y asignacion de roles
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo usuario
        </button>
      </div>

      <div className="card !p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <svg width="15" height="15" className="absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="input-field pl-9 text-sm"
            placeholder="Buscar por nombre, usuario, correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select-field w-auto text-sm"
          value={rolFilter}
          onChange={(e) => setRolFilter(e.target.value)}
        >
          <option value="all">Todos los roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}{r.code ? ` (${r.code})` : ""}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size={32} />
        </div>
      ) : (
        <div className="table-container bg-white">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre completo</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No se encontraron usuarios registrados
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="table-row-hover">
                    <td>
                      <code>@{u.user_name}</code>
                    </td>
                    <td className="font-medium text-sm">
                      {u.nombre} {u.apellidos}
                    </td>
                    <td className="text-sm" style={{ color: "var(--color-muted)" }}>
                      {u.correo}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="badge badge-primary font-semibold">
                          {u.rol?.nombre || "Sin Rol"}
                        </span>
                        {u.rol?.code && (
                          <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                            {u.rol.code}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={"badge " + (u.estado ? "badge-success" : "badge-neutral")}>
                        {u.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-secondary py-1 px-2.5 text-xs"
                        onClick={() => handleToggleEstado(u)}
                      >
                        {u.estado ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ModalNuevoUsuario
          roles={roles}
          onClose={() => setShowModal(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}
