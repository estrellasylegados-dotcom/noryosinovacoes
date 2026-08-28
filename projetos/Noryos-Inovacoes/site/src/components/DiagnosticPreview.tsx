"use client";

import { CSSProperties } from "react";
import { useInView } from "@/lib/hooks";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { diagnosticoMock } from "@/content/home";

/**
 * §18 — o Diagnóstico Digital como ferramenta visual, não texto + botão.
 * Mock claramente rotulado "Demonstração ilustrativa" (regra de
 * credibilidade: nunca passar como dado de cliente real). As barras
 * preenchem quando entram na viewport.
 */
function tone(v: number) {
  if (v >= 65) return "var(--color-green)";
  if (v >= 45) return "var(--color-cyan)";
  return "color-mix(in oklab, var(--color-cyan) 55%, var(--color-text-dim))";
}

export function DiagnosticPreview() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3 });

  return (
    <div ref={ref} data-anim="fade-up" className={`panel p-6 sm:p-8 ${inView ? "is-in" : ""}`}>
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 font-mono text-xs tracking-[0.16em] text-[var(--color-text-muted)]">
          <Icon name="spark" size={14} className="text-[var(--color-cyan)]" />
          DIAGNÓSTICO DIGITAL
        </span>
        <span className="rounded-full border border-[var(--hairline-strong)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
          Demonstração ilustrativa
        </span>
      </div>

      <div className="mt-6 grid gap-4">
        {diagnosticoMock.metricas.map((m, i) => (
          <div key={m.label}>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">{m.label}</span>
              <span className="t-mono text-sm text-[var(--color-text)]">{m.valor}</span>
            </div>
            <div className="sheen-track mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--color-surface-3)]" style={{ "--sheen-delay": `${i * 700}ms` } as CSSProperties}>
              <div
                className="fill-bar h-full rounded-full"
                style={
                  {
                    width: `${m.valor}%`,
                    background: tone(m.valor),
                    "--fill-delay": `${i * 110}ms`,
                  } as CSSProperties
                }
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7 border-t border-[var(--hairline)] pt-5">
        <p className="text-sm font-semibold text-[var(--color-text)]">
          {diagnosticoMock.oportunidades.length} oportunidades identificadas
        </p>
        <ul className="mt-3 grid gap-2">
          {diagnosticoMock.oportunidades.map((o) => (
            <li key={o} className="flex items-center gap-2.5 text-sm text-[var(--color-text-muted)]">
              <Icon name="check" size={15} className="shrink-0 text-[var(--color-green)]" />
              {o}
            </li>
          ))}
        </ul>
      </div>

      <ButtonLink href="/diagnostico" variant="primary" className="mt-7 w-full" withArrow>
        Solicitar meu diagnóstico
      </ButtonLink>
    </div>
  );
}
