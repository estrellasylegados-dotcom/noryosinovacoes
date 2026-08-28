/**
 * Mock abstrato de site/landing responsivo — desktop + mobile — pro card de
 * Presença Digital (§14). Puramente decorativo, sem texto real, sem número.
 */
export function BrowserPreview() {
  return (
    <div className="relative select-none" aria-hidden>
      {/* janela desktop */}
      <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--hairline-strong)] bg-[var(--color-surface-1)] shadow-[var(--elev-2)]">
        <div className="flex items-center gap-1.5 border-b border-[var(--hairline)] px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[var(--color-text-dim)]/50" />
          <span className="h-2 w-2 rounded-full bg-[var(--color-text-dim)]/50" />
          <span className="h-2 w-2 rounded-full bg-[var(--color-text-dim)]/50" />
          <span className="ml-3 h-3 flex-1 rounded-full bg-[var(--color-surface-3)]" />
        </div>
        <div className="space-y-3 p-4">
          <div className="h-3 w-2/5 rounded bg-[var(--color-cyan)]/70" />
          <div className="h-2 w-3/4 rounded bg-[var(--color-surface-3)]" />
          <div className="h-2 w-2/3 rounded bg-[var(--color-surface-3)]" />
          <div className="mt-3 flex gap-3">
            <div className="h-16 flex-1 rounded-md bg-[var(--color-surface-3)]" />
            <div className="h-16 flex-1 rounded-md bg-[var(--color-surface-3)]" />
            <div className="h-16 flex-1 rounded-md bg-[var(--color-surface-3)]" />
          </div>
          <div className="mt-1 h-6 w-28 rounded bg-[var(--color-green)]/70" />
        </div>
      </div>
      {/* handset mobile sobreposto */}
      <div className="absolute -bottom-6 -right-2 w-24 overflow-hidden rounded-[14px] border border-[var(--hairline-strong)] bg-[var(--color-surface-2)] shadow-[var(--elev-3)] sm:w-28">
        <div className="mx-auto mt-2 h-1 w-8 rounded-full bg-[var(--color-text-dim)]/50" />
        <div className="space-y-2 p-3">
          <div className="h-2.5 w-3/5 rounded bg-[var(--color-cyan)]/70" />
          <div className="h-2 w-full rounded bg-[var(--color-surface-3)]" />
          <div className="h-2 w-4/5 rounded bg-[var(--color-surface-3)]" />
          <div className="h-10 w-full rounded bg-[var(--color-surface-3)]" />
          <div className="h-5 w-full rounded bg-[var(--color-green)]/70" />
        </div>
      </div>
    </div>
  );
}
