export default function EmptyState({ message = "Sin datos disponibles" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>{message}</p>
    </div>
  );
}
