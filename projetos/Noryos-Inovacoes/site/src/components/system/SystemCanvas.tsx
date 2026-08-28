"use client";

import { CSSProperties, useEffect, useState } from "react";
import { useMouseParallax } from "@/lib/hooks";

/**
 * O "sistema vivo" do hero (§6) — os módulos do Noryos OS como partes de um
 * ecossistema conectado. SVG + CSS: linhas que se desenham na entrada,
 * pulsos que viajam pelas conexões, parallax leve no mouse. Sem partícula
 * aleatória, sem Matrix, sem esfera 3D. Decorativo (aria-hidden) — a
 * mensagem está no texto do hero ao lado.
 */

type Node = { id: string; label: string; x: number; y: number; kind: "hub" | "node" };

const NODES: Node[] = [
  { id: "presenca", label: "PRESENÇA", x: 78, y: 208, kind: "node" },
  { id: "aquisicao", label: "AQUISIÇÃO", x: 250, y: 74, kind: "node" },
  { id: "automacao", label: "AUTOMAÇÃO", x: 300, y: 224, kind: "hub" },
  { id: "conteudo", label: "CONTEÚDO", x: 468, y: 120, kind: "node" },
  { id: "dados", label: "DADOS", x: 182, y: 356, kind: "node" },
  { id: "evolucao", label: "EVOLUÇÃO", x: 448, y: 352, kind: "node" },
];

const EDGES: [string, string][] = [
  ["presenca", "automacao"],
  ["aquisicao", "automacao"],
  ["automacao", "conteudo"],
  ["automacao", "dados"],
  ["dados", "evolucao"],
  ["conteudo", "evolucao"],
  ["presenca", "dados"],
];

const byId = (id: string) => NODES.find((n) => n.id === id)!;

const CHIP_W = 116;
const CHIP_H = 30;

export function SystemCanvas({ faint = false }: { faint?: boolean }) {
  const [ref, mouse] = useMouseParallax<HTMLDivElement>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  const layer = (depth: number): CSSProperties => ({
    transform: `translate3d(${mouse.x * depth}px, ${mouse.y * depth}px, 0)`,
    transition: "transform 500ms var(--ease-soft)",
  });

  return (
    <div ref={ref} className="relative h-full w-full" aria-hidden>
      <svg
        viewBox="0 0 546 440"
        className="h-full w-full overflow-visible"
        style={{ opacity: faint ? 0.4 : 1 }}
      >
        <defs>
          <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-cyan)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--color-green)" stopOpacity="0.7" />
          </linearGradient>
          <radialGradient id="halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-cyan)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--color-cyan)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* halo atrás do hub — respira lentamente */}
        <circle
          cx={byId("automacao").x}
          cy={byId("automacao").y}
          r="150"
          fill="url(#halo)"
          className="ambient-drift"
        />

        {/* conexões */}
        <g style={layer(4)} className={mounted ? "is-in" : ""}>
          {EDGES.map(([a, b], i) => {
            const n1 = byId(a);
            const n2 = byId(b);
            const len = Math.hypot(n2.x - n1.x, n2.y - n1.y);
            return (
              <g key={`${a}-${b}`}>
                <line
                  x1={n1.x}
                  y1={n1.y}
                  x2={n2.x}
                  y2={n2.y}
                  stroke="var(--hairline-strong)"
                  strokeWidth="1"
                />
                <line
                  x1={n1.x}
                  y1={n1.y}
                  x2={n2.x}
                  y2={n2.y}
                  stroke="url(#edge)"
                  strokeWidth="1.4"
                  className="draw-line"
                  style={{ "--len": len, "--draw-delay": `${i * 90}ms` } as CSSProperties}
                />
                <line
                  x1={n1.x}
                  y1={n1.y}
                  x2={n2.x}
                  y2={n2.y}
                  stroke="var(--color-cyan)"
                  strokeWidth={faint ? 1.4 : 1.8}
                  strokeLinecap="round"
                  strokeOpacity={faint ? 0.4 : 1}
                  strokeDasharray={`3 ${len}`}
                  className="flow-line"
                  style={
                    {
                      "--flow-len": len + 3,
                      "--flow-delay": `${900 + i * (faint ? 900 : 520)}ms`,
                    } as CSSProperties
                  }
                />
              </g>
            );
          })}
        </g>

        {/* nós / chips */}
        <g style={layer(9)}>
          {NODES.map((n, i) => {
            const isHub = n.kind === "hub";
            return (
              <g
                key={n.id}
                data-anim="scale-in"
                className={mounted ? "is-in" : ""}
                style={{ "--anim-delay": `${300 + i * 80}ms`, transformOrigin: `${n.x}px ${n.y}px` } as CSSProperties}
              >
                <g
                  className={!faint && !isHub ? "ambient-float" : undefined}
                  style={{ "--float-delay": `${i * 620}ms` } as CSSProperties}
                >
                  <rect
                    x={n.x - CHIP_W / 2}
                    y={n.y - CHIP_H / 2}
                    width={CHIP_W}
                    height={CHIP_H}
                    rx={CHIP_H / 2}
                    fill="var(--color-surface-raised)"
                    stroke={isHub ? "var(--color-cyan)" : "var(--hairline-strong)"}
                    strokeWidth={isHub ? 1.4 : 1}
                  />
                  <circle
                    cx={n.x - CHIP_W / 2 + 16}
                    cy={n.y}
                    r={isHub ? 3.4 : 2.6}
                    fill={isHub ? "var(--color-cyan)" : "var(--color-green)"}
                    className={faint ? undefined : "node-pulse"}
                    style={{ "--pulse-delay": `${i * 360}ms` } as CSSProperties}
                  />
                  <text
                    x={n.x - CHIP_W / 2 + 28}
                    y={n.y + 3}
                    fill={isHub ? "var(--color-text)" : "var(--color-text-muted)"}
                    fontFamily="var(--font-mono), monospace"
                    fontSize="9.5"
                    letterSpacing="1.5"
                  >
                    {n.label}
                  </text>
                </g>
              </g>
            );
          })}
        </g>

        {/* pontos flutuantes de profundidade */}
        <g style={layer(15)}>
          {[
            [40, 90],
            [510, 250],
            [120, 400],
            [400, 40],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.6"
              fill="var(--color-cyan)"
              opacity="0.4"
              className={faint ? undefined : "node-pulse"}
              style={{ "--pulse-delay": `${i * 700}ms` } as CSSProperties}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
