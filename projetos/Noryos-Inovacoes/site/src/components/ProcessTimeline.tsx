"use client";

import { CSSProperties } from "react";
import { useInView, useScrollProgress } from "@/lib/hooks";
import { Icon } from "@/components/ui/Icon";
import { processo } from "@/content/home";

/**
 * §19 — "Como trabalhamos" como timeline viva. A linha progride conforme a
 * seção passa pela viewport; a etapa atual ganha destaque. Horizontal no
 * desktop, vertical no mobile.
 */
export function ProcessTimeline() {
  const [ref, progress] = useScrollProgress<HTMLDivElement>();
  const [inViewRef, inView] = useInView<HTMLDivElement>();
  const fill = Math.min(1, Math.max(0, (progress - 0.2) / 0.55));
  const activeIndex = Math.min(processo.length - 1, Math.floor(fill * processo.length + 0.0001));

  const setRefs = (el: HTMLDivElement | null) => {
    ref.current = el;
    inViewRef.current = el;
  };

  return (
    <div ref={setRefs}>
      {/* desktop */}
      <div className="hidden md:block">
        <div className="relative grid grid-cols-4 gap-6 pt-10">
          <div className="absolute left-0 right-0 top-[46px] h-px bg-[var(--hairline-strong)]" aria-hidden />
          <div
            className="absolute left-0 top-[46px] h-px origin-left bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-green)]"
            style={{ width: "100%", transform: `scaleX(${fill})`, transition: "transform 120ms linear" }}
            aria-hidden
          />
          {processo.map((step, i) => {
            const on = i <= activeIndex;
            return (
              <div
                key={step.n}
                data-anim="fade-up"
                className={`relative ${inView ? "is-in" : ""}`}
                style={{ "--anim-delay": `${i * 90}ms` } as CSSProperties}
              >
                <span
                  className="relative z-10 grid h-7 w-7 place-items-center rounded-full border text-[var(--color-cyan)] transition-colors duration-300"
                  style={{
                    borderColor: on ? "var(--color-cyan)" : "var(--hairline-strong)",
                    background: on ? "var(--color-surface-raised)" : "var(--color-surface-1)",
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full transition-colors duration-300"
                    style={{ background: on ? "var(--color-cyan)" : "var(--color-text-dim)" }}
                  />
                </span>
                <span className="mt-5 block font-mono text-2xl text-[var(--color-text-dim)]">{step.n}</span>
                <span className="mt-2 flex items-center gap-2">
                  <Icon name={step.icon} size={16} className="text-[var(--color-cyan)]" />
                  <span className="t-h3 text-base">{step.titulo}</span>
                </span>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{step.descricao}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* mobile */}
      <ol className="relative mt-2 grid gap-7 md:hidden">
        <span className="absolute bottom-4 left-[13px] top-4 w-px bg-[var(--hairline-strong)]" aria-hidden />
        <span
          className="absolute left-[13px] top-4 w-px origin-top bg-gradient-to-b from-[var(--color-cyan)] to-[var(--color-green)]"
          style={{ height: "calc(100% - 32px)", transform: `scaleY(${fill})`, transition: "transform 120ms linear" }}
          aria-hidden
        />
        {processo.map((step, i) => {
          const on = i <= activeIndex;
          return (
            <li
              key={step.n}
              data-anim="fade-left"
              className={`relative flex gap-4 ${inView ? "is-in" : ""}`}
              style={{ "--anim-delay": `${i * 80}ms` } as CSSProperties}
            >
              <span
                className="relative z-10 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-colors duration-300"
                style={{
                  borderColor: on ? "var(--color-cyan)" : "var(--hairline-strong)",
                  background: on ? "var(--color-surface-raised)" : "var(--color-surface-1)",
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: on ? "var(--color-cyan)" : "var(--color-text-dim)" }}
                />
              </span>
              <div>
                <span className="font-mono text-sm text-[var(--color-text-dim)]">{step.n}</span>
                <h3 className="t-h3 text-base">{step.titulo}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{step.descricao}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
