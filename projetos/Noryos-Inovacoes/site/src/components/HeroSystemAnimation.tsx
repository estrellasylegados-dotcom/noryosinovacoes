/**
 * Animação abstrata do "sistema em funcionamento" — grid sutil + nós
 * conectados por linhas com fluxo de dados. SVG + CSS puro (sem canvas,
 * sem WebGL, sem partícula aleatória). Server Component: não precisa de JS
 * no cliente pra existir, só CSS anima.
 */
const nodes = [
  { x: 60, y: 60 },
  { x: 220, y: 40 },
  { x: 340, y: 130 },
  { x: 160, y: 180 },
  { x: 300, y: 240 },
  { x: 60, y: 220 },
];

const links: [number, number][] = [
  [0, 1],
  [1, 2],
  [1, 3],
  [3, 5],
  [3, 4],
  [2, 4],
];

export function HeroSystemAnimation() {
  return (
    <svg
      viewBox="0 0 400 300"
      className="h-full w-full"
      role="img"
      aria-label="Representação abstrata de um sistema digital conectado"
    >
      {links.map(([a, b], i) => {
        const n1 = nodes[a];
        const n2 = nodes[b];
        return (
          <line
            key={i}
            x1={n1.x}
            y1={n1.y}
            x2={n2.x}
            y2={n2.y}
            stroke="var(--color-border-strong)"
            strokeWidth="1"
          />
        );
      })}
      {links.map(([a, b], i) => {
        const n1 = nodes[a];
        const n2 = nodes[b];
        return (
          <line
            key={`flow-${i}`}
            x1={n1.x}
            y1={n1.y}
            x2={n2.x}
            y2={n2.y}
            stroke="var(--color-cyan)"
            strokeWidth="1.5"
            strokeDasharray="4 220"
            className="flow-line"
            style={{ animationDelay: `${i * 0.6}s` }}
          />
        );
      })}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={i === 3 ? 6 : 4}
          fill={i === 3 ? "var(--color-green)" : "var(--color-cyan)"}
          className="node-pulse"
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
      <style>{`
        .flow-line {
          animation: flow 3.2s linear infinite;
          opacity: 0.9;
        }
        @keyframes flow {
          from { stroke-dashoffset: 224; }
          to { stroke-dashoffset: 0; }
        }
        .node-pulse {
          animation: pulse 2.8s ease-in-out infinite;
          transform-origin: center;
          transform-box: fill-box;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.25); }
        }
      `}</style>
    </svg>
  );
}
