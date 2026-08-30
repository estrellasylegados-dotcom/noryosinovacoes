"use client";

import { CSSProperties } from "react";
import { useInView } from "@/lib/hooks";
import { Icon, type IconName } from "@/components/ui/Icon";

/**
 * Mini fluxo de automação pro card correspondente (§14): Lead → WhatsApp →
 * CRM → Follow-up. As conexões se desenham e um pulso desce quando entra na
 * viewport. Decorativo — descrição textual pra leitor de tela.
 */
const steps: { label: string; icon: IconName }[] = [
  { label: "Lead", icon: "relacionamento" },
  { label: "WhatsApp", icon: "automacao" },
  { label: "CRM", icon: "dados" },
  { label: "Follow-up", icon: "evolucao" },
];

export function AutomationFlow() {
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className="relative" role="img" aria-label="Fluxo: lead chega, entra no WhatsApp, é registrado no CRM e recebe follow-up automático.">
      <div className="relative grid gap-3">
        <span className="absolute bottom-5 left-[15px] top-5 w-px bg-[var(--hairline-strong)]" aria-hidden />
        <span
          className={`absolute left-[15px] top-5 w-px origin-top bg-gradient-to-b from-[var(--color-cyan)] to-[var(--color-green)] ${inView ? "is-in" : ""}`}
          style={{ height: "calc(100% - 40px)", transform: inView ? "scaleY(1)" : "scaleY(0)", transition: "transform var(--dur-4) var(--ease-soft)" }}
          aria-hidden
        />
        {steps.map((s, i) => (
          <div
            key={s.label}
            data-anim="fade-left"
            className={`relative flex items-center gap-3 ${inView ? "is-in" : ""}`}
            style={{ "--anim-delay": `${i * 130}ms` } as CSSProperties}
          >
            <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--hairline-strong)] bg-[var(--color-surface-raised)] text-[var(--color-cyan)]">
              <Icon name={s.icon} size={15} />
            </span>
            <span className="text-sm font-medium tracking-tight">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
