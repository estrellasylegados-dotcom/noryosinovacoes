"use client";

import { CSSProperties, useState } from "react";
import { useInView } from "@/lib/hooks";
import { Icon } from "@/components/ui/Icon";
import { segmentos } from "@/content/solucoes";

/**
 * Cenários por segmento — mesmo padrão do ApplicationScenarios da home:
 * seletor + cadeia de chips que entra em sequência. Estático fora o reveal
 * (reduced-motion tratado no globals.css). Cada cenário é aplicação
 * ilustrativa, nunca um case ou resultado.
 */
export function SegmentFlows() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [current, setCurrent] = useState(0);
  const seg = segmentos[current];

  return (
    <div ref={ref}>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Segmentos de negócio">
        {segmentos.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={current === i}
            onClick={() => setCurrent(i)}
            className={`rounded-full border px-4 py-2 text-sm font-medium tracking-tight transition-colors duration-200 ${
              current === i
                ? "border-[var(--color-cyan)] bg-[var(--color-surface-raised)] text-[var(--color-text)]"
                : "border-[var(--hairline-strong)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {s.titulo}
          </button>
        ))}
      </div>

      <div key={seg.id} className="panel mt-6 p-6 sm:p-8">
        <span className="rounded-full border border-[var(--hairline-strong)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
          Cenário de aplicação
        </span>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {seg.fluxo.map((etapa, i) => (
            <div key={etapa} className="flex items-center gap-3 sm:contents">
              <span
                data-anim="fade-up"
                className={`inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--hairline-strong)] bg-[var(--color-surface-2)] px-3.5 py-2 text-sm tracking-tight ${
                  inView ? "is-in" : ""
                } ${
                  i === seg.fluxo.length - 1
                    ? "text-[var(--color-green)]"
                    : "text-[var(--color-text)]"
                }`}
                style={{ "--anim-delay": `${i * 90}ms` } as CSSProperties}
              >
                {etapa}
              </span>
              {i < seg.fluxo.length - 1 && (
                <Icon
                  name="arrow"
                  size={16}
                  className={`shrink-0 rotate-90 text-[var(--color-text-dim)] sm:rotate-0 ${
                    inView ? "is-in" : ""
                  }`}
                  style={{
                    opacity: inView ? 1 : 0,
                    transition: `opacity var(--dur-2) ease ${i * 90 + 45}ms`,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-7 border-t border-[var(--hairline)] pt-5">
          <span className="t-label text-[var(--color-text-dim)]">Onde costuma travar</span>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {seg.problemas.map((p) => (
              <li key={p} className="flex gap-2.5 text-sm text-[var(--color-text-muted)]">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--color-text-dim)]" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
