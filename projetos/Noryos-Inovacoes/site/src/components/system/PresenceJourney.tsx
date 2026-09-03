"use client";

import { CSSProperties } from "react";
import { useInView, useReducedMotion, useScrollProgress } from "@/lib/hooks";
import { Icon } from "@/components/ui/Icon";
import { IllustrativeCaption } from "@/components/system/_primitives";
import { presencaJornada as BLOCKS } from "@/content/home";

/**
 * §14 — card Presença Digital. Não é um mockup animado: é a jornada que uma
 * página bem-feita conduz. Conforme você rola a seção, um "visitante" desce
 * pela página (Hero → Prova → Oferta) e é levado até o Contato — o bloco de
 * CTA acende em verde. Desktop e mobile mostram a MESMA jornada, na mesma
 * profundidade, ao mesmo tempo (sincronizados).
 *
 * Sem cursor falso, sem autoplay: a descida é guiada pelo scroll
 * (`useScrollProgress`). Um único ponto pulsa na ponta do progresso (pausa
 * fora da viewport). prefers-reduced-motion → jornada concluída, estática.
 */

const N = BLOCKS.length;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type BlockState = "idle" | "active" | "passed" | "done";

export function PresenceJourney() {
  const reduced = useReducedMotion();
  const [progRef, progress] = useScrollProgress<HTMLDivElement>();
  const [inRef, live] = useInView<HTMLDivElement>({ once: false });

  const setRefs = (el: HTMLDivElement | null) => {
    progRef.current = el;
    inRef.current = el;
  };

  // Completa com o card em posição de leitura (não só quando ele já sai por
  // cima) — mesma correção do SystemFlow.
  const journey = reduced ? 1 : clamp01((progress - 0.12) / 0.42);
  const activeIdx = Math.min(N - 1, Math.floor(journey * N + 1e-6));
  const reached = journey >= 0.92;

  const blockState = (i: number): BlockState => {
    if (reached && i === N - 1) return "done";
    if (i < activeIdx) return "passed";
    if (i === activeIdx) return "active";
    return "idle";
  };

  const frame = (kind: "desktop" | "mobile") => (
    <div className={`pj-frame pj-frame--${kind}`} data-reached={reached || undefined}>
      {kind === "desktop" ? (
        <div className="pj-chrome">
          <span />
          <span />
          <span />
          <i className="pj-url" />
        </div>
      ) : (
        <span className="pj-notch" />
      )}
      <div className="pj-page" style={{ "--j": String(journey) } as CSSProperties}>
        <span className="pj-progress" />
        {live && !reduced && <span className="pj-dot" />}
        {BLOCKS.map((b, i) => (
          <div key={b.id} className="pj-block" data-id={b.id} data-state={blockState(i)}>
            {kind === "desktop" && <span className="pj-block-label">{b.label}</span>}
            <span className="pj-fill">
              <span className="pj-line" />
              <span className="pj-line pj-line--sm" />
            </span>
            {b.id === "contato" && (
              <span className="pj-cta">
                <span className="pj-cta-pill" />
                {kind === "desktop" && (
                  <span className="pj-cta-check">
                    <Icon name="check" size={11} />
                  </span>
                )}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      ref={setRefs}
      className="pj"
      data-journey={journey.toFixed(2)}
      role="img"
      aria-label="Ilustração: um visitante percorre a página — hero, prova, oferta — e é conduzido até o contato. A mesma jornada no desktop e no mobile."
    >
      <div className="pj-frames">
        {frame("desktop")}
        {frame("mobile")}
      </div>
      <IllustrativeCaption>Ilustração — a página conduz o visitante até o contato</IllustrativeCaption>
    </div>
  );
}
