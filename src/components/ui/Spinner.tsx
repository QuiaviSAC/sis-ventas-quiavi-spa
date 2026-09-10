export default function Spinner({ size = 20 }: { size?: number }) {
  return (
    <span
      className="inline-block rounded-full border-2 animate-spin"
      style={{
        width: size,
        height: size,
        borderColor: "var(--color-primary)",
        borderTopColor: "transparent",
      }}
    />
  );
}
