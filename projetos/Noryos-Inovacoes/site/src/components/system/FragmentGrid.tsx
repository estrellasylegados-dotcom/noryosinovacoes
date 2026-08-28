"use client";

import { CSSProperties } from "react";
import { useInView } from "@/lib/hooks";
import { Icon, type IconName } from "@/components/ui/Icon";
import { fragmentos } from "@/content/home";

/**
 * §12 — as partes de uma operação digital que costumam funcionar isoladas.
 * No começo: nós soltos. Quando a seção entra na viewport, algumas conexões
 * são desenhadas — preparando a ideia de "operação como sistema" da seção
 * seguinte.
 */

// posições em % dentro do palco (desktop)
const POS: Record<string, { x: number; y: number }> = {
  Site: { x: 13, y: 22 },
  Anúncios: { x: 76, y: 14 },
  Leads: { x: 47, y: 52 },
  Conteúdo: { x: 16, y: 82 },
  Atendimento: { x: 82, y: 76 },
};

const LINKS: [string, string][] = [
  ["Site", "Leads"],
  ["Anúncios", "Leads"],
  ["Conteúdo", "Leads"],
  ["Leads", "Atendimento"],
  ["Anúncios", "Atendimento"],
];

export function FragmentGrid() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.35 });

  return (
    <div ref={ref}>
      {/* palco desktop */}
      <div className="relative hidden aspect-[16/8] w-full md:block">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className={`absolute inset-0 h-full w-full ${inView ? "is-in" : ""}`}
        >
          {LINKS.map(([a, b], i) => {
            const p1 = POS[a];
            const p2 = POS[b];
            const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            return (
              <line
                key={`${a}-${b}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="var(--color-cyan)"
                strokeOpacity="0.5"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                className="draw-line"
                style={{ "--len": len, "--draw-delay": `${200 + i * 120}ms` } as CSSProperties}
              />
            );
          })}
        </svg>

        {fragmentos.map((f, i) => {
          const p = POS[f.nome];
          return (
            <div
              key={f.nome}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <div
                data-anim="scale-in"
                className={inView ? "is-in" : ""}
                style={{ "--anim-delay": `${i * 90}ms` } as CSSProperties}
              >
                <FragmentChip nome={f.nome} icon={f.icon} active={f.nome === "Leads"} />
              </div>
            </div>
          );
        })}
      </div>

      {/* stack mobile */}
      <div className="relative md:hidden">
        <span
          className="absolute bottom-5 left-[19px] top-5 w-px bg-gradient-to-b from-transparent via-[var(--color-cyan)]/40 to-transparent"
          aria-hidden
        />
        <ul className="grid gap-3">
          {fragmentos.map((f, i) => (
            <li
              key={f.nome}
              data-anim="fade-left"
              className={`relative flex items-center gap-3 ${inView ? "is-in" : ""}`}
              style={{ "--anim-delay": `${i * 80}ms` } as CSSProperties}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--hairline-strong)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                <Icon name={f.icon} size={18} />
              </span>
              <span className="text-sm font-medium">{f.nome}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FragmentChip({ nome, icon, active }: { nome: string; icon: IconName; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-full border px-3.5 py-2 ${
        active
          ? "border-[var(--color-cyan)] bg-[var(--color-surface-raised)] text-[var(--color-text)] shadow-[var(--elev-1)]"
          : "border-[var(--hairline-strong)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
      }`}
    >
      <Icon name={icon} size={16} className={active ? "text-[var(--color-cyan)]" : ""} />
      <span className="text-xs font-medium tracking-tight">{nome}</span>
    </div>
  );
}
