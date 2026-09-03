"use client";

import {
  type ReactNode,
  type RefObject,
  type SVGProps,
  useEffect,
  useRef,
  useState,
} from "react";
import { useInView, useReducedMotion } from "@/lib/hooks";
import { Icon, type IconName } from "@/components/ui/Icon";

/**
 * Primitivos compartilhados dos gráficos de seção da home. Extraídos de
 * `AutomationConveyor` (esteira) e `PerformancePanel` (painel) — só o que é
 * de fato comum, e o que a seção "operação fragmentada → conectada" reusa.
 *
 * NÃO tem aqui: lógica da esteira, lógica do gráfico, textos, layout de
 * seção, timings específicos. O visual vive em globals.css (`.sys-*`).
 */

/* ------------------------------------------------------------------ *
 *  useRevealOnce — revelação única, "latchada"
 * ------------------------------------------------------------------ */

/**
 * `true` em SSR / sem-JS / `prefers-reduced-motion`; caso contrário passa a
 * `true` quando o elemento entra na viewport e **nunca volta** a `false`
 * (não re-anima ao rolar pra cima).
 */
export function useRevealOnce<T extends HTMLElement = HTMLDivElement>(): [
  RefObject<T | null>,
  boolean,
] {
  const reduced = useReducedMotion();
  const [ref, entered] = useInView<T>();
  const [armed, setArmed] = useState(false);
  useEffect(() => setArmed(true), []);
  return [ref, !armed || reduced || entered];
}

/* ------------------------------------------------------------------ *
 *  IllustrativeCaption
 * ------------------------------------------------------------------ */

/** Legenda "isto é ilustração, não dado real" — mono, minúscula, discreta. */
export function IllustrativeCaption({ children }: { children: ReactNode }) {
  return <p className="sys-caption">{children}</p>;
}

/* ------------------------------------------------------------------ *
 *  SystemNode — chip de nó com estados
 * ------------------------------------------------------------------ */

export type NodeState = "idle" | "active" | "done";

export function SystemNode({
  icon,
  label,
  state = "idle",
  accent = "cyan",
  size = "md",
  layout = "col",
  className = "",
}: {
  icon: IconName;
  label?: string;
  state?: NodeState;
  accent?: "cyan" | "green";
  size?: "sm" | "md";
  layout?: "col" | "row";
  className?: string;
}) {
  return (
    <span
      className={`sys-node ${className}`.trim()}
      data-state={state}
      data-accent={accent}
      data-size={size}
      data-layout={layout}
    >
      <span className="sys-node-dot">
        <Icon name={icon} size={size === "sm" ? 16 : 18} />
      </span>
      {label != null && <span className="sys-node-label">{label}</span>}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 *  Connection — conexão SVG ponto a ponto, com progresso
 * ------------------------------------------------------------------ */

export function Connection({
  x1,
  y1,
  x2,
  y2,
  progress = 1,
  broken = false,
  className = "",
  ...rest
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** 0..1 — quanto da conexão já está traçada */
  progress?: number;
  /** caminho que não chega ao destino: desenha só um trecho e para */
  broken?: boolean;
  className?: string;
} & Omit<SVGProps<SVGGElement>, "x1" | "y1" | "x2" | "y2">) {
  const raw = broken ? Math.min(progress, 0.5) : progress;
  const draw = Math.max(0, Math.min(1, raw));
  // conexão que ainda não começou a se formar não aparece (nem o traço-guia)
  if (!broken && draw <= 0.001) return null;
  const solid = !broken && draw >= 0.999;
  // Numa conexão "quebrada" o próprio traço-guia também não chega ao destino.
  const baseDraw = broken ? draw + 0.14 : 1;
  const len = Math.hypot(x2 - x1, y2 - y1) || 0.001;
  return (
    <g className={`sys-conn ${className}`.trim()} data-broken={broken || undefined} {...rest}>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className="sys-conn-base"
        strokeDasharray={broken ? len : undefined}
        strokeDashoffset={broken ? len * (1 - baseDraw) : undefined}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className="sys-conn-live"
        strokeDasharray={solid ? undefined : len}
        strokeDashoffset={solid ? undefined : len * (1 - draw)}
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
}

/* ------------------------------------------------------------------ *
 *  ActivityToken — ponto de atividade (pulso opcional)
 * ------------------------------------------------------------------ */

/**
 * Ponto SVG. Com `pulse`, respira devagar — e **pausa quando sai da
 * viewport**, retomando ao voltar (sem reiniciar mais nada). Sem `pulse`,
 * é só um ponto (posicionado pelo pai, ex.: percorrendo um caminho).
 */
export function ActivityToken({
  accent = "cyan",
  pulse = false,
  className = "",
  ...rest
}: {
  accent?: "cyan" | "green";
  pulse?: boolean;
  className?: string;
} & Omit<SVGProps<SVGCircleElement>, "ref">) {
  const el = useRef<SVGCircleElement | null>(null);
  const [live, setLive] = useState(true);

  useEffect(() => {
    if (!pulse) return;
    const node = el.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), {
      rootMargin: "160px",
    });
    io.observe(node);
    return () => io.disconnect();
  }, [pulse]);

  return (
    <circle
      ref={el}
      className={`sys-token ${pulse && live ? "node-pulse" : ""} ${className}`.replace(/\s+/g, " ").trim()}
      data-accent={accent}
      {...rest}
    />
  );
}
