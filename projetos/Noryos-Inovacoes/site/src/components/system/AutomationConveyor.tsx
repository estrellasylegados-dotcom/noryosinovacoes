"use client";

import { CSSProperties, useEffect, useState } from "react";
import { useInView, useReducedMotion } from "@/lib/hooks";
import { Icon } from "@/components/ui/Icon";
import { IllustrativeCaption } from "@/components/system/_primitives";
import { fluxoAutomacao } from "@/content/home";

/**
 * §14 — card Automação. Esteira operacional: um lead entra e percorre
 * Lead → WhatsApp → CRM → Follow-up, cada etapa reagindo quando o pulso
 * chega (causa → efeito, não uma lista).
 *
 * O ciclo é dirigido por um único requestAnimationFrame que percorre a
 * agenda de marcos abaixo e escreve dois valores de estado: `stage` (0..4,
 * qual etapa está acesa) e `p` (posição do token no trilho, 0..1). Todo o
 * visual e as transições vivem no CSS (`.cv*` em globals.css). Sem
 * biblioteca de animação — mesmo padrão de SystemCanvas / SystemFlow.
 *
 * - prefers-reduced-motion → estado final "conectado" (tudo concluído),
 *   sem loop, sem pulso.
 * - document.hidden pausa o ciclo e reinicia limpo ao voltar.
 * - fora da viewport (useInView) o rAF não roda.
 *
 * Layout: horizontal só a partir de ~1180px (onde os 4 nós respiram); abaixo
 * disso, vertical — nunca comprimir a linha nem quebrar microstatus de forma
 * feia (clareza > insistência no horizontal).
 */

const CYCLE_MS = 8300;

type Beat = { at: number; stage?: number; p?: number; token?: boolean };

// Deslocamento entre etapas = 800ms (transição CSS do token, --dur-4). O
// `stage` só troca quando o token CHEGA — nunca quando parte —, então a
// etapa acende no instante em que o pulso encosta nela.
const BEATS: Beat[] = [
  { at: 0, stage: 0, p: 0, token: false }, // início / reset suave da volta anterior
  { at: 250, token: true }, //                 o lead "entra" no fluxo
  { at: 950, p: 1 / 3 }, //                     parte → WhatsApp
  { at: 1750, stage: 1 }, //                    chega → WhatsApp acende + microstatus
  { at: 2850, p: 2 / 3 }, //                    parte → CRM
  { at: 3650, stage: 2 }, //                    chega → CRM acende + microstatus
  { at: 4750, p: 1 }, //                        parte → Follow-up
  { at: 5550, stage: 3 }, //                    chega → Follow-up acende (verde) + microstatus
  { at: 7550, stage: 4, token: false }, //      concluído: segura ~2s, o token some
];

export function AutomationConveyor() {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>({ once: false });
  const [stage, setStage] = useState(0);
  const [p, setP] = useState(0);
  const [token, setToken] = useState(false);

  useEffect(() => {
    if (reduced || !inView) return;

    let raf = 0;
    let start = 0;
    let idx = 0;
    let prev = -1;

    const apply = (b: Beat) => {
      if (b.stage !== undefined) setStage(b.stage);
      if (b.p !== undefined) setP(b.p);
      if (b.token !== undefined) setToken(b.token);
    };

    const frame = (now: number) => {
      if (!start) start = now;
      const t = (now - start) % CYCLE_MS;
      if (t < prev) idx = 0; // deu a volta no ciclo
      prev = t;
      while (idx < BEATS.length && t >= BEATS[idx].at) apply(BEATS[idx++]);
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => {
      if (document.hidden) {
        stop();
        return;
      }
      if (!raf) {
        start = 0;
        idx = 0;
        prev = -1;
        setStage(0);
        setP(0);
        setToken(false);
        raf = requestAnimationFrame(frame);
      }
    };

    raf = requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced, inView]);

  // Estado efetivo pra render. Em reduced-motion, congela no fim conectado.
  const effStage = reduced ? 4 : stage;
  const effP = reduced ? 1 : p;
  const tokenOn = reduced ? false : token;

  const nodeState = (i: number): "idle" | "active" | "done" => {
    if (effStage >= 4 || i < effStage) return "done";
    if (i === effStage) return "active";
    return "idle";
  };

  const rail = (
    <div className="cv-track">
      <span className="cv-rail" />
      <span className="cv-rail-fill" />
      <span className="cv-token" data-token={tokenOn ? "on" : "off"} />
    </div>
  );

  return (
    <div
      ref={ref}
      className="cv"
      data-stage={effStage}
      data-reduced={reduced ? "true" : undefined}
      style={{ "--p": String(effP) } as CSSProperties}
      role="img"
      aria-label="Esteira de automação: um lead entra pelo site, recebe resposta automática no WhatsApp, é registrado no CRM e tem a próxima ação agendada como follow-up."
    >
      {/* horizontal — só a partir de ~1180px */}
      <div className="cv--h relative hidden min-[1180px]:block" aria-hidden>
        {rail}
        <div className="cv-nodes grid grid-cols-4">
          {fluxoAutomacao.map((n, i) => (
            <div key={n.id} className="cv-node" data-node={n.id} data-state={nodeState(i)}>
              <span className="cv-node-icon">
                <Icon name={n.icon} size={18} />
              </span>
              <span className="cv-node-label">{n.nome}</span>
              <span className="cv-node-status">{n.status}</span>
              <span className="cv-tip">{n.descricao}</span>
            </div>
          ))}
        </div>
      </div>

      {/* vertical — abaixo de ~1180px (largura travada pra não esticar em card largo) */}
      <div className="cv--v relative grid h-72 max-w-[26rem] grid-rows-4 min-[1180px]:hidden" aria-hidden>
        {rail}
        {fluxoAutomacao.map((n, i) => (
          <div key={n.id} className="cv-node" data-node={n.id} data-state={nodeState(i)}>
            <span className="cv-node-icon">
              <Icon name={n.icon} size={17} />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="cv-node-label">{n.nome}</span>
              <span className="cv-node-status">{n.status}</span>
            </span>
          </div>
        ))}
      </div>

      <IllustrativeCaption>Fluxo ilustrativo</IllustrativeCaption>
    </div>
  );
}
