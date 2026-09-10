import { useState, useRef } from "react";
import { subirExcelMasivo, type ExcelImportError } from "../../services/excel.service";
import Spinner from "../ui/Spinner";

interface ModalCargaMasivaProps {
  onClose: () => void;
  onSuccess: () => Promise<void>;
  onDescargarPlantilla: () => void;
}

export default function ModalCargaMasiva({
  onClose,
  onSuccess,
  onDescargarPlantilla,
}: ModalCargaMasivaProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ExcelImportError[]>([]);
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filtroError, setFiltroError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectFile(e.dataTransfer.files[0]);
    }
  };

  const selectFile = (selectedFile: File) => {
    if (
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls") &&
      !selectedFile.name.endsWith(".csv")
    ) {
      setGeneralError("El archivo seleccionado debe ser un archivo Excel (.xlsx, .xls) o .csv");
      return;
    }
    setFile(selectedFile);
    setGeneralError("");
    setErrors([]);
    setSuccessMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setGeneralError("Por favor selecciona un archivo Excel.");
      return;
    }

    setLoading(true);
    setGeneralError("");
    setErrors([]);
    setSuccessMessage("");

    try {
      const resp = await subirExcelMasivo(file);

      if (resp.success) {
        setSuccessMessage(
          resp.message ||
            `¡Carga masiva exitosa! Se han insertado ${resp.total_insertados ?? ""} productos correctamente.`
        );
        await onSuccess();
      } else {
        if (resp.errors && resp.errors.length > 0) {
          setErrors(resp.errors);
          if (resp.message) {
            setGeneralError(resp.message);
          }
        } else {
          setGeneralError(
            resp.error || resp.message || "Ocurrió un error durante la validación del archivo Excel."
          );
        }
      }
    } catch (err: any) {
      setGeneralError(err.message ?? "Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const filteredErrors = errors.filter(
    (e) =>
      !filtroError ||
      e.codigo.toLowerCase().includes(filtroError.toLowerCase()) ||
      e.campo.toLowerCase().includes(filtroError.toLowerCase()) ||
      e.mensaje.toLowerCase().includes(filtroError.toLowerCase()) ||
      String(e.fila).includes(filtroError)
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 820 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#E8E8E8" }}>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-[#1E1E1E]">Carga Masiva de Productos (Excel)</h2>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-neutral-100 text-[#595959] border border-[#BFBFBF]">
                Atómica / Todo o Nada
              </span>
            </div>
            <p className="text-xs text-[#808080] mt-0.5">
              Valida todas las filas antes de insertar. Si hay 1 error, se cancela para evitar datos corruptos.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-[#808080] hover:text-[#1E1E1E]">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 max-h-[78vh] overflow-y-auto">
          {/* Banner de descarga de plantilla */}
          <div className="p-4 rounded-xl border bg-[#F8F8F8] flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: "#E0E0E0" }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E8E8E8] flex items-center justify-center shrink-0 text-[#1E1E1E]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold text-[#1E1E1E]">¿Necesitas la plantilla oficial?</div>
                <div className="text-[11px] text-[#595959]">
                  Incluye categorías y abreviaturas reales de la base de datos para no tener rechazos.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onDescargarPlantilla}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center justify-center gap-1.5 font-bold shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descargar Plantilla .xlsx
            </button>
          </div>

          {/* Zona Drag & Drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? "border-[#D32F2F] bg-red-50/20"
                : errors.length > 0
                ? "border-red-400 bg-red-50/10"
                : file
                ? "border-[#2E7D32] bg-emerald-50/20"
                : "border-[#BFBFBF] hover:border-[#808080] bg-white"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.value && e.target.files?.[0]) {
                  selectFile(e.target.files[0]);
                }
              }}
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center ${
                    errors.length > 0
                      ? "bg-red-100 text-[#D32F2F]"
                      : "bg-emerald-100 text-[#2E7D32]"
                  }`}
                >
                  {errors.length > 0 ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div className="font-bold text-sm text-[#1E1E1E]">{file.name}</div>
                <div className="text-xs text-[#808080]">
                  {(file.size / 1024).toFixed(1)} KB — Clic aquí para seleccionar otro archivo
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-11 h-11 rounded-full bg-gray-100 text-[#595959] flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="font-semibold text-sm text-[#1E1E1E]">
                  Arrastra tu archivo Excel aquí, o{" "}
                  <span className="text-[#D32F2F] underline">explora tus carpetas</span>
                </div>
                <div className="text-xs text-[#808080]">Soporta .xlsx, .xls y .csv</div>
              </div>
            )}
          </div>

          {/* Mensaje de Éxito */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[#2E7D32] flex items-center gap-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>
                <span className="text-xs font-bold block">{successMessage}</span>
                <span className="text-[11px] text-emerald-800">El catálogo ya fue actualizado en pantalla.</span>
              </div>
            </div>
          )}

          {/* Mensaje de Error General / Advertencia de Rollback */}
          {generalError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[#D32F2F]">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="flex-1">
                <span className="font-bold block">Transacción abortada:</span>
                <span>{generalError}</span>
              </div>
            </div>
          )}

          {/* TABLA DETALLADA DE ERRORES POR FILA (ALL-OR-NOTHING REPORT) */}
          {errors.length > 0 && (
            <div className="flex flex-col gap-2.5 border border-red-200 rounded-xl p-4 bg-red-50/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-red-800 uppercase tracking-wide flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                      <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.length} inconsistencias detectadas — Ningún registro fue insertado
                  </span>
                  <p className="text-[11px] text-red-600 mt-0.5">
                    Corrige los siguientes errores en tu archivo Excel y vuelve a subirlo:
                  </p>
                </div>
                {errors.length > 5 && (
                  <input
                    type="text"
                    placeholder="Filtrar errores..."
                    value={filtroError}
                    onChange={(e) => setFiltroError(e.target.value)}
                    className="input-field text-xs py-1 px-2.5 w-48 bg-white"
                  />
                )}
              </div>

              <div className="table-container bg-white border border-red-200 rounded-lg max-h-64 overflow-y-auto">
                <table>
                  <thead>
                    <tr className="bg-red-100/60 text-[#1E1E1E]">
                      <th style={{ width: "14%" }}>Posición</th>
                      <th style={{ width: "20%" }}>Código Producto</th>
                      <th style={{ width: "22%" }}>Columna con Error</th>
                      <th>Motivo de Rechazo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredErrors.map((err, i) => (
                      <tr key={i} className="hover:bg-red-50/50">
                        <td>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                            Línea {err.fila}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-xs font-bold text-[#1E1E1E]">
                            {err.codigo || "N/A"}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-[#3D3D3D] border border-gray-200">
                            {err.campo}
                          </span>
                        </td>
                        <td className="text-xs text-red-700 font-medium">
                          {err.mensaje}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-[#FAFAFA] rounded-b-2xl" style={{ borderColor: "#E8E8E8" }}>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={onClose}
            disabled={loading}
          >
            {successMessage ? "Cerrar" : "Cancelar"}
          </button>
          {!successMessage && (
            <button
              type="button"
              className="btn-primary text-xs font-bold flex items-center gap-2"
              onClick={handleUpload}
              disabled={loading || !file}
            >
              {loading ? (
                <>
                  <Spinner size={14} color="white" />
                  <span>Validando y asegurando transacción...</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 16 12 12 8 16" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                  </svg>
                  <span>{errors.length > 0 ? "Reintentar Validación" : "Procesar Archivo"}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
