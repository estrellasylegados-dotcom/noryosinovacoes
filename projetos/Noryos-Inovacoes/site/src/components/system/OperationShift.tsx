"use client";

import { CSSProperties } from "react";
import { useReducedMotion, useScrollProgress } from "@/lib/hooks";
import { Container } from "@/components/ui/Container";
import {
  SystemNode,
  Connection,
  IllustrativeCaption,
  type NodeState,
} from "@/components/system/_primitives";
import { operacaoNos as NOS, operacaoConexoes as CONEXOES } from "@/content/home";

/**
 * §2/§3 — "operação fragmentada → conectada". Uma peça só: o palco começa
 * com as partes soltas (conexões incompletas, pulsos que morrem no meio),
 * a transformação acontece guiada pelo scroll (nós reposicionam, conexões
 * se completam, o Noryos OS assume o centro) e termina como sistema —
 * organizado, conectado, com pequenos pulsos percorrendo os caminhos.
 *
 * Sem biblioteca de animação: um único valor de scroll (`useScrollProgress`)
 * dirige interpolações de posição + `stroke-dashoffset` + limiares de
 * estado. Desktop: canvas "colado" (sticky) por ~0.6 tela enquanto a
 * transformação roda. Mobile: composição vertical própria, fluxo normal.
 * prefers-reduced-motion → estado final conectado, estático.
 */

const VW = 100;
const VH = 68;
const byId = (id: string) => NOS.find((n) => n.id === id)!;

// pequeno escalonamento na hora de reposicionar: o Noryos OS sai primeiro
// (vira a âncora), os nós de canal um pouco depois — evita trajetórias que
// se cruzam e rótulos colidindo no meio da transição.
const MOVE_DELAY: Record<string, number> = {
  os: -0.05,
  leads: -0.02,
  conteudo: 0.04,
  site: 0.06,
  anuncios: 0.06,
  atend: 0.09,
  dados: 0.11,
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const seg = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

type Conexao = (typeof CONEXOES)[number];

function derive(t: number) {
  const phase: "fragmented" | "morphing" | "connected" =
    t < 0.16 ? "fragmented" : t < 0.86 ? "morphing" : "connected";

  const pos = (id: string) => {
    const n = byId(id);
    const dl = MOVE_DELAY[id] ?? 0;
    const m = easeInOut(seg(t, 0.18 + dl, 0.64 + dl));
    return { x: lerp(n.frag.x, n.sys.x, m), y: lerp(n.frag.y, n.sys.y, m) };
  };

  const conn = (c: Conexao) => {
    const formT = clamp01((t - 0.24 - c.order * 0.16) / 0.3);
    if (c.frag === "none") return { progress: formT, broken: false, thin: false };
    if (c.frag === "thin") return { progress: 1, broken: false, thin: t < 0.5 };
    return { progress: Math.max(0.45, formT), broken: formT < 0.6, thin: false };
  };

  const nodeState = (id: string): NodeState => {
    if (t >= 0.86) return "done";
    if (t < 0.22) return "idle";
    const rel = CONEXOES.filter((c) => c.from === id || c.to === id);
    const minOrder = rel.length ? Math.min(...rel.map((c) => c.order)) : 0;
    return t > 0.24 + minOrder * 0.16 + 0.22 ? "active" : "idle";
  };

  return {
    phase,
    pos,
    conn,
    nodeState,
    osScale: lerp(1, 1.34, easeInOut(seg(t, 0.5, 0.92))),
    haloOpacity: lerp(0, 0.7, easeInOut(seg(t, 0.55, 0.95))),
  };
}

const PHASE_WORD = {
  fragmented: "peças soltas",
  morphing: "conectando",
  connected: "operando como sistema",
} as const;

/* ------------------------------------------------------------------ */

function OperationCanvas({ t, reduced }: { t: number; reduced: boolean }) {
  const d = derive(t);
  const os = d.pos("os");
  const yPct = (y: number) => (y / VH) * 100;

  return (
    <>
      <div className="os-stage" data-phase={d.phase} data-t={t.toFixed(2)} aria-hidden>
        <div className="os-nodes">
          <span
            className="os-halo"
            style={{ left: `${os.x}%`, top: `${yPct(os.y)}%`, opacity: d.haloOpacity }}
          />
        </div>

        <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" className="os-svg">
          {CONEXOES.map((c) => {
            const a = d.pos(c.from);
            const b = d.pos(c.to);
            const cs = d.conn(c);
            return (
              <Connection
                key={`${c.from}-${c.to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                progress={cs.progress}
                broken={cs.broken}
                className={cs.thin ? "os-conn--thin" : ""}
              />
            );
          })}

          {!reduced &&
            d.phase === "fragmented" &&
            (
              [
                ["site", "leads"],
                ["anuncios", "leads"],
              ] as const
            ).map(([f, tId], i) => {
              const a = d.pos(f);
              const b = d.pos(tId);
              const len = Math.hypot(b.x - a.x, b.y - a.y);
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className="os-pulse os-pulse--die"
                  style={{ "--len": len, "--d": `${i * 900}ms` } as CSSProperties}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}

          {!reduced &&
            d.phase === "connected" &&
            (
              [
                ["site", "leads"],
                ["leads", "atend"],
                ["atend", "dados"],
              ] as const
            ).map(([f, tId], i) => {
              const a = d.pos(f);
              const b = d.pos(tId);
              const len = Math.hypot(b.x - a.x, b.y - a.y);
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className="os-pulse os-pulse--run"
                  style={{ "--len": len, "--d": `${i * 1100}ms` } as CSSProperties}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
        </svg>

        <div className="os-nodes">
          {NOS.map((n) => {
            const p = d.pos(n.id);
            const isOs = n.id === "os";
            return (
              <div
                key={n.id}
                className="os-node"
                data-id={n.id}
                data-hub={isOs && d.phase === "connected" ? "" : undefined}
                style={
                  {
                    left: `${p.x}%`,
                    top: `${yPct(p.y)}%`,
                    transform: `translate(-50%, -50%) scale(${isOs ? d.osScale : 1})`,
                  } as CSSProperties
                }
              >
                <SystemNode
                  icon={n.icon}
                  label={n.label}
                  state={d.nodeState(n.id)}
                  accent={isOs ? "green" : "cyan"}
                  size={isOs ? "md" : "sm"}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="os-foot">
        <span className="os-phase" data-phase={d.phase}>
          {PHASE_WORD[d.phase]}
        </span>
        <IllustrativeCaption>Ilustração conceitual</IllustrativeCaption>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

const MOBILE_ORDER = ["os", "site", "conteudo", "anuncios", "leads", "atend", "dados"];

// deslocamento lateral (px) de cada linha no estado fragmentado — "solto",
// desalinhado; zera quando conecta.
const MOBILE_JITTER: Record<string, number> = {
  os: -14,
  site: 10,
  conteudo: -8,
  anuncios: 14,
  leads: -6,
  atend: 12,
  dados: -10,
};

function OperationMobile({ mt, reduced }: { mt: number; reduced: boolean }) {
  const t = reduced ? 1 : mt;
  const fill = easeInOut(seg(t, 0.2, 0.72));
  const align = easeInOut(seg(t, 0.24, 0.68)); // 0 solto → 1 alinhado
  const connected = t > 0.74;
  const phase = t < 0.28 ? "fragmented" : connected ? "connected" : "morphing";

  const state = (i: number): NodeState => {
    if (t >= 0.8) return "done";
    if (t < 0.26) return "idle";
    return fill > (i + 0.4) / MOBILE_ORDER.length ? "active" : "idle";
  };

  return (
    <div
      className="os-m"
      data-connected={connected || undefined}
      data-mt={t.toFixed(2)}
      aria-hidden
    >
      <div className="os-m-track">
        <div className="os-m-rail" data-broken={!connected || undefined}>
          <span className="os-m-fill" style={{ transform: `scaleY(${fill})` }} />
          {connected && !reduced && <span className="os-m-runner" />}
        </div>
        <ol className="os-m-list">
          {MOBILE_ORDER.map((id, i) => {
            const n = byId(id);
            const st = state(i);
            const jx = (MOBILE_JITTER[id] ?? 0) * (1 - align);
            return (
              <li
                key={id}
                className="os-m-row"
                data-id={id}
                data-state={st}
                style={{ transform: `translateX(${jx.toFixed(1)}px)` }}
              >
                <SystemNode
                  icon={n.icon}
                  label={n.label}
                  state={st}
                  accent={id === "os" ? "green" : "cyan"}
                  size="sm"
                  layout="row"
                />
                {id === "os" && <span className="os-m-tag">desconectado</span>}
                {id === "dados" && <span className="os-m-tag">isolado</span>}
              </li>
            );
          })}
        </ol>
      </div>
      <div className="os-foot">
        <span className="os-phase" data-phase={phase}>
          {PHASE_WORD[phase]}
        </span>
        <IllustrativeCaption>Ilustração conceitual</IllustrativeCaption>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function OperationShift() {
  const reduced = useReducedMotion();
  const [deskRef, deskProgress] = useScrollProgress<HTMLDivElement>();
  const [mobRef, mobProgress] = useScrollProgress<HTMLDivElement>();

  // `deskProgress` cobre toda a zona de 135vh; a janela em que o canvas fica
  // "colado" (sticky) é progress ~[0.38, 0.64]. Mapeia o miolo dela pra
  // t 0..1, deixando folga no início (segura o fragmentado colado) e no fim
  // (segura o conectado com os pulsos rodando) antes de descolar.
  const t = reduced ? 1 : clamp01((deskProgress - 0.4) / 0.19);

  return (
    <div className="os-shift">
      {/* desktop: zona de scroll que dirige a transformação */}
      <div
        ref={deskRef}
        className="os-scroll hidden md:block"
        data-reduced={reduced || undefined}
      >
        <div className="os-sticky">
          <Container>
            <OperationCanvas t={t} reduced={reduced} />
          </Container>
        </div>
      </div>

      {/* mobile: composição própria */}
      <div ref={mobRef} className="md:hidden">
        <Container>
          <OperationMobile mt={mobProgress} reduced={reduced} />
        </Container>
      </div>
    </div>
  );
}
