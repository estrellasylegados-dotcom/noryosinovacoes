"use client";

import { CSSProperties } from "react";
import { useInView, useCountUp } from "@/lib/hooks";
import { animDelay } from "@/lib/motion";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { diagnosticoMock } from "@/content/home";

/**
 * §18 — o Diagnóstico Digital como ferramenta visual, não texto + botão.
 * Mock claramente rotulado "Demonstração ilustrativa" (regra de
 * credibilidade: nunca passar como dado de cliente real). Quando entra na
 * viewport: as barras preenchem em stagger e os números contam até o valor
 * ilustrativo; a lista de oportunidades aparece depois.
 */
function tone(v: number) {
  if (v >= 65) return "var(--color-green)";
  if (v >= 45) return "var(--color-cyan)";
  return "color-mix(in oklab, var(--color-cyan) 55%, var(--color-text-dim))";
}

function Metric({
  label,
  valor,
  index,
  active,
}: {
  label: string;
  valor: number;
  index: number;
  active: boolean;
}) {
  const count = useCountUp(valor, active, 900 + index * 120);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
        <span className="t-mono text-sm text-[var(--color-text)] tabular-nums">{count}</span>
      </div>
      <div
        className="sheen-track mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--color-surface-3)]"
        style={{ "--sheen-delay": `${index * 700}ms` } as CSSProperties}
      >
        <div
          className="fill-bar h-full rounded-full"
          style={
            {
              width: `${valor}%`,
              background: tone(valor),
              "--fill-delay": `${index * 110}ms`,
            } as CSSProperties
          }
        />
      </div>
    </div>
  );
}

export function DiagnosticPreview() {
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <div ref={ref} data-anim="fade-up" className={`panel p-6 sm:p-8 ${inView ? "is-in" : ""}`}>
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 font-mono text-xs tracking-[0.16em] text-[var(--color-text-muted)]">
          <Icon name="spark" size={14} className="text-[var(--color-cyan)]" />
          DIAGNÓSTICO DIGITAL
        </span>
        <span className="rounded-full border border-[var(--hairline-strong)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
          Representação ilustrativa
        </span>
      </div>

      <div className="mt-6 grid gap-4">
        {diagnosticoMock.metricas.map((m, i) => (
          <Metric key={m.label} label={m.label} valor={m.valor} index={i} active={inView} />
        ))}
      </div>

      <div
        data-anim="fade-up"
        className={`mt-7 border-t border-[var(--hairline)] pt-5 ${inView ? "is-in" : ""}`}
        style={animDelay(760)}
      >
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
