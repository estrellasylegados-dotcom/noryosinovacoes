"use client";

import { CSSProperties } from "react";
import { useInView } from "@/lib/hooks";
import { Icon } from "@/components/ui/Icon";
import { Connection, IllustrativeCaption, useRevealOnce } from "@/components/system/_primitives";
import { conteudoCanais as CANAIS } from "@/content/home";

/**
 * §14 — card Conteúdo e Presença. Uma estratégia central distribuída e
 * adaptada aos canais (Site, Instagram, Google, WhatsApp). Não são 4 cards:
 * é uma origem → vários destinos. Ao entrar na viewport (revelação única,
 * como Aquisição): a estratégia entra, as conexões se traçam, cada canal
 * recebe a versão e o formato se adapta, todos terminam coerentes — "uma
 * estratégia, vários pontos de contato".
 *
 * Sem carrossel, sem card girando, sem feed/post fictício, sem logo de
 * plataforma, sem loop infinito chamativo. prefers-reduced-motion / sem-JS
 * → estado final completo e conectado.
 */

const HUB = { x: 50, y: 50 };
const POS: Record<string, { x: number; y: number }> = {
  site: { x: 22, y: 24 },
  instagram: { x: 78, y: 24 },
  google: { x: 22, y: 76 },
  whatsapp: { x: 78, y: 76 },
};

function FormatShape({ format }: { format: string }) {
  switch (format) {
    case "page":
      return (
        <>
          <rect x="2.5" y="3.5" width="15" height="13" rx="1.5" />
          <line x1="2.5" y1="7.5" x2="17.5" y2="7.5" />
        </>
      );
    case "square":
      return <rect x="3.5" y="3.5" width="13" height="13" rx="1.5" />;
    case "search":
      return (
        <>
          <line x1="3" y1="8" x2="17" y2="8" />
          <line x1="3" y1="12" x2="11" y2="12" />
        </>
      );
    case "chat":
      return <path d="M3.5 4.5h13v8h-7l-3 3v-3h-3z" />;
    default:
      return null;
  }
}

export function ChannelHub() {
  const [revealRef, revealed] = useRevealOnce<HTMLDivElement>();
  const [inRef, live] = useInView<HTMLDivElement>({ once: false });

  const setRefs = (el: HTMLDivElement | null) => {
    revealRef.current = el;
    inRef.current = el;
  };

  return (
    <div
      ref={setRefs}
      className="ch"
      data-revealed={revealed || undefined}
      data-live={live || undefined}
      role="img"
      aria-label="Uma estratégia central distribuída para Site, Instagram, Google e WhatsApp — a mesma mensagem adaptada ao formato de cada canal."
    >
      <div className="ch-stage">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="ch-svg">
          {CANAIS.map((c, i) => (
            <Connection
              key={c.id}
              x1={HUB.x}
              y1={HUB.y}
              x2={POS[c.id].x}
              y2={POS[c.id].y}
              progress={revealed ? 1 : 0}
              className={`ch-conn ch-conn--${i}`}
            />
          ))}
        </svg>

        <div className="ch-nodes">
          <div className="ch-hub" style={{ left: `${HUB.x}%`, top: `${HUB.y}%` }}>
            <span className="ch-hub-dot">
              <Icon name="conteudo" size={16} />
            </span>
            <span className="ch-hub-label">Mensagem central</span>
          </div>

          {CANAIS.map((c, i) => (
            <div
              key={c.id}
              className="ch-ch"
              data-id={c.id}
              data-state={revealed ? "active" : "idle"}
              style={{ left: `${POS[c.id].x}%`, top: `${POS[c.id].y}%`, "--i": i } as CSSProperties}
            >
              <span className="ch-format">
                <svg viewBox="0 0 20 20" aria-hidden>
                  <FormatShape format={c.format} />
                </svg>
              </span>
              <span className="ch-ch-label">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      <IllustrativeCaption>Uma estratégia. Vários pontos de contato.</IllustrativeCaption>
    </div>
  );
}
