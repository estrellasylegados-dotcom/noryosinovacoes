export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-green)]">
      {children}
    </span>
  );
}
