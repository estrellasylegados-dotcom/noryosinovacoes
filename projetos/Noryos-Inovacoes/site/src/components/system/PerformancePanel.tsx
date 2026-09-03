"use client";

import { CSSProperties, PointerEvent, useState } from "react";
import {
  ActivityToken,
  IllustrativeCaption,
  useRevealOnce,
} from "@/components/system/_primitives";
import { aquisicaoPainel as D } from "@/content/home";

/**
 * §14 — card Aquisição e Performance. Painel de leitura, não gráfico
 * decorativo: duas linhas (investimento vs. retorno em índice relativo),
 * a margem entre elas, 3 indicadores direcionais e um ponto de decisão.
 *
 * Mesma linguagem da esteira de Automação (idle → atividade → progresso →
 * confirmação; ciano = ativo, verde = positivo) mas SEM esteira: aqui nada
 * "viaja". Quando o painel entra na viewport o traçado ganha ênfase — as
 * linhas acendem, a margem preenche da esquerda pra direita (progresso), os
 * indicadores entram e o ponto de decisão aparece (confirmação). Um único
 * ponto pulsa na ponta da linha de retorno (repouso).
 *
 * - Sem número absoluto: só índice relativo (base 100) e variação %. Rótulo
 *   "Exemplo de acompanhamento" sempre visível.
 * - Em repouso (ainda não roldado até ele) o gráfico continua legível como
 *   gráfico — linhas presentes, só mais discretas.
 * - prefers-reduced-motion / sem-JS → traçado completo e estático.
 */

const N = D.investimento.length;
const VIEW_W = 100;
const VIEW_H = 44;
const PAD = 4;
const VALUES = [...D.investimento, ...D.retorno];
const MIN = Math.min(...VALUES);
const MAX = Math.max(...VALUES);

const px = (i: number) => (i / (N - 1)) * VIEW_W;
const py = (v: number) => PAD + (1 - (v - MIN) / (MAX - MIN)) * (VIEW_H - PAD * 2);
const points = (arr: readonly number[]) =>
  arr.map((v, i) => `${px(i).toFixed(2)},${py(v).toFixed(2)}`).join(" ");
const areaPath = () => {
  const top = D.retorno.map((v, i) => `${px(i).toFixed(2)} ${py(v).toFixed(2)}`).join(" L ");
  const bottom = D.investimento
    .map((v, i) => `${px(i).toFixed(2)} ${py(v).toFixed(2)}`)
    .reverse()
    .join(" L ");
  return `M ${top} L ${bottom} Z`;
};

export function PerformancePanel() {
  const [ref, revealed] = useRevealOnce<HTMLDivElement>();
  const [hoverWeek, setHoverWeek] = useState<number | null>(null);

  const dec = D.decisao.semana;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const t = (e.clientX - r.left) / r.width;
    setHoverWeek(Math.max(0, Math.min(N - 1, Math.round(t * (N - 1)))));
  };

  return (
    <div
      ref={ref}
      className="pp"
      data-revealed={revealed || undefined}
      data-hover={hoverWeek !== null || undefined}
      role="img"
      aria-label="Acompanhamento ilustrativo de aquisição: ao longo de 8 semanas a linha de retorno cresce e passa a superar a de investimento; os indicadores de custo por lead, conversão e retorno melhoram. Índice relativo, sem dado de cliente."
    >
      <div className="pp-legend">
        <span>
          <i className="pp-sw pp-sw--inv" />
          investimento
        </span>
        <span>
          <i className="pp-sw pp-sw--ret" />
          retorno
        </span>
      </div>

      <div className="pp-chart" onPointerMove={onMove} onPointerLeave={() => setHoverWeek(null)}>
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" className="pp-svg">
          <line
            x1="0"
            y1={VIEW_H - PAD}
            x2={VIEW_W}
            y2={VIEW_H - PAD}
            className="pp-axis"
            vectorEffect="non-scaling-stroke"
          />
          {D.investimento.map((_, i) => (
            <line
              key={i}
              x1={px(i)}
              y1={PAD}
              x2={px(i)}
              y2={VIEW_H - PAD}
              className="pp-grid"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          <path d={areaPath()} className="pp-area" />
          <polyline
            points={points(D.investimento)}
            className="pp-line pp-line--inv"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={points(D.retorno)}
            className="pp-line pp-line--ret"
            vectorEffect="non-scaling-stroke"
          />
          <ActivityToken
            pulse
            cx={px(N - 1)}
            cy={py(D.retorno[N - 1])}
            r="1.5"
            className="pp-live"
            vectorEffect="non-scaling-stroke"
          />

          {revealed && (
            <circle
              cx={px(dec)}
              cy={py(D.retorno[dec])}
              r="2.4"
              className="pp-decision-ring"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {hoverWeek !== null && (
            <g className="pp-scrub">
              <line
                x1={px(hoverWeek)}
                y1={PAD}
                x2={px(hoverWeek)}
                y2={VIEW_H - PAD}
                vectorEffect="non-scaling-stroke"
              />
              <circle cx={px(hoverWeek)} cy={py(D.investimento[hoverWeek])} r="1.9" className="pp-scrub-inv" />
              <circle cx={px(hoverWeek)} cy={py(D.retorno[hoverWeek])} r="1.9" className="pp-scrub-ret" />
            </g>
          )}
        </svg>

        {revealed && (
          <span
            className="pp-decision-tag"
            style={{ left: `${px(dec)}%`, top: `${(py(D.retorno[dec]) / VIEW_H) * 100}%` }}
          >
            {D.decisao.rotulo}
          </span>
        )}

        {hoverWeek !== null && (
          <span className="pp-readout">
            sem. {hoverWeek + 1} · índice {D.retorno[hoverWeek]}
          </span>
        )}
      </div>

      <div className="pp-kpis">
        {D.kpis.map((k, i) => {
          const up = k.delta >= 0;
          return (
            <div
              key={k.id}
              className={`pp-kpi ${revealed ? "is-in" : ""}`}
              data-anim="fade"
              data-good={k.sentido === "bom" || undefined}
              style={{ "--anim-delay": `${450 + i * 90}ms` } as CSSProperties}
            >
              <span className="pp-kpi-label">{k.label}</span>
              <span className="pp-kpi-value">
                <span className="pp-kpi-arrow">{up ? "▲" : "▼"}</span>
                {up ? "+" : "−"}
                {Math.abs(k.delta)}%
              </span>
              <svg viewBox="0 0 40 14" preserveAspectRatio="none" className="pp-spark">
                <polyline
                  points={k.spark
                    .map((v, j) => `${(j / (k.spark.length - 1)) * 40},${13 - (v / 100) * 12}`)
                    .join(" ")}
                  className="pp-spark-line"
                  pathLength={1}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          );
        })}
      </div>

      <IllustrativeCaption>
        Exemplo de acompanhamento · índice relativo, sem dado de cliente
      </IllustrativeCaption>
    </div>
  );
}
