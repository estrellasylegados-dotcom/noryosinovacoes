"use client";

import { CSSProperties } from "react";
import { useInView, useScrollProgress } from "@/lib/hooks";
import { Icon } from "@/components/ui/Icon";
import { fluxoSistema } from "@/content/home";

/**
 * §13 — a mesma operação, funcionando como sistema. Fluxo horizontal no
 * desktop / vertical no mobile. A linha ganha vida conforme a seção passa
 * pela viewport (scroll progress, não autoplay).
 */
export function SystemFlow() {
  const [ref, progress] = useScrollProgress<HTMLDivElement>();
  const [inViewRef, inView] = useInView<HTMLDivElement>();
  // mapeia 0.15..0.85 do progresso pra 0..1 do preenchimento
  const fill = Math.min(1, Math.max(0, (progress - 0.15) / 0.6));
  const activeIndex = Math.min(fluxoSistema.length - 1, Math.floor(fill * fluxoSistema.length));

  const setRefs = (el: HTMLDivElement | null) => {
    ref.current = el;
    inViewRef.current = el;
  };

  return (
    <div ref={setRefs}>
      {/* desktop */}
      <div className="hidden md:block">
        <div className="relative mt-4 grid grid-cols-6 gap-4">
          <div className="absolute left-0 right-0 top-6 h-px bg-[var(--hairline-strong)]" aria-hidden />
          <div
            className="absolute left-0 top-6 h-px origin-left bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-green)]"
            style={{ width: "100%", transform: `scaleX(${fill})`, transition: "transform 120ms linear" }}
            aria-hidden
          />
          <span
            className="rail-runner absolute top-6 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-cyan)] shadow-[0_0_10px_2px_rgba(45,212,255,0.45)]"
            aria-hidden
          />
          {fluxoSistema.map((step, i) => {
            const on = i <= activeIndex;
            return (
              <div
                key={step.nome}
                data-anim="fade-up"
                className={`relative flex flex-col items-center text-center ${inView ? "is-in" : ""}`}
                style={{ "--anim-delay": `${i * 80}ms` } as CSSProperties}
              >
                <span
                  className="relative z-10 grid h-12 w-12 place-items-center rounded-full border transition-colors duration-300"
                  style={{
                    borderColor: on ? "var(--color-cyan)" : "var(--hairline-strong)",
                    background: on ? "var(--color-surface-raised)" : "var(--color-surface-1)",
                    color: on ? "var(--color-cyan)" : "var(--color-text-dim)",
                  }}
                >
                  <Icon name={step.icon} size={20} />
                </span>
                <span className="mt-3 text-xs font-mono uppercase tracking-widest text-[var(--color-text-dim)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-1 text-sm font-semibold tracking-tight">{step.nome}</span>
                <span className="mt-1 text-xs text-[var(--color-text-muted)]">{step.nota}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* mobile */}
      <ol className="relative mt-2 grid gap-4 md:hidden">
        <span className="absolute bottom-6 left-6 top-6 w-px bg-[var(--hairline-strong)]" aria-hidden />
        <span
          className="absolute left-6 top-6 w-px origin-top bg-gradient-to-b from-[var(--color-cyan)] to-[var(--color-green)]"
          style={{ height: "calc(100% - 48px)", transform: `scaleY(${fill})`, transition: "transform 120ms linear" }}
          aria-hidden
        />
        <span
          className="rail-runner-y absolute left-6 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-cyan)] shadow-[0_0_10px_2px_rgba(45,212,255,0.45)]"
          aria-hidden
        />
        {fluxoSistema.map((step, i) => {
          const on = i <= activeIndex;
          return (
            <li
              key={step.nome}
              data-anim="fade-left"
              className={`relative flex items-start gap-4 pl-0 ${inView ? "is-in" : ""}`}
              style={{ "--anim-delay": `${i * 70}ms` } as CSSProperties}
            >
              <span
                className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-colors duration-300"
                style={{
                  borderColor: on ? "var(--color-cyan)" : "var(--hairline-strong)",
                  background: on ? "var(--color-surface-raised)" : "var(--color-surface-1)",
                  color: on ? "var(--color-cyan)" : "var(--color-text-dim)",
                }}
              >
                <Icon name={step.icon} size={20} />
              </span>
              <span className="pt-1.5">
                <span className="block text-sm font-semibold tracking-tight">{step.nome}</span>
                <span className="block text-xs text-[var(--color-text-muted)]">{step.nota}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
