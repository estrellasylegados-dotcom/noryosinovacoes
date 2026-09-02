"use client";

import { CSSProperties } from "react";
import { useInView } from "@/lib/hooks";

/**
 * Gráfico ilustrativo pro card de Aquisição e Performance (§14). NÃO
 * representa dado de cliente — forma abstrata de "campanha + conversões".
 * Barras sobem quando entra na viewport.
 */
const bars = [34, 52, 41, 63, 58, 78, 70, 92];

export function MiniChart() {
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <div ref={ref} aria-hidden>
      <div className="flex items-end gap-1.5" style={{ height: 96 }}>
        {bars.map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-t-[3px]"
            style={
              {
                // repouso em ~45% do valor final (não uma linha rasa): mesmo sem
                // a animação disparar — scroll rápido, JS atrasado — já lê como
                // gráfico, não como algo quebrado.
                height: inView ? `${h}%` : `${Math.round(h * 0.45)}%`,
                background:
                  i === bars.length - 1
                    ? "linear-gradient(180deg, var(--color-green), color-mix(in oklab, var(--color-green) 40%, transparent))"
                    : "linear-gradient(180deg, color-mix(in oklab, var(--color-cyan) 70%, transparent), color-mix(in oklab, var(--color-cyan) 12%, transparent))",
                transition: "height var(--dur-4) var(--ease-soft)",
                transitionDelay: `${i * 55}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="mt-2 h-px w-full bg-[var(--hairline-strong)]" />
      <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-dim)]">
        Ilustrativo
      </p>
    </div>
  );
}
