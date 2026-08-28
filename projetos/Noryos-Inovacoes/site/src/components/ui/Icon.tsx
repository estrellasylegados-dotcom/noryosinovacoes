import type { SVGProps } from "react";

/**
 * Set de ícones lineares próprio da Noryos — stroke 1.5, grid 24, cantos
 * levemente arredondados. Um estilo só (§31). Sempre decorativo:
 * `aria-hidden` por padrão; o rótulo vem do texto ao lado.
 */
export type IconName =
  | "arrow"
  | "presenca"
  | "aquisicao"
  | "automacao"
  | "dados"
  | "conteudo"
  | "evolucao"
  | "relacionamento"
  | "documentacao"
  | "check"
  | "chevron"
  | "folder"
  | "folder-open"
  | "spark"
  | "node";

const paths: Record<IconName, React.ReactNode> = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  presenca: (
    <>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 8h18M7 21h10" />
    </>
  ),
  aquisicao: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  automacao: (
    <>
      <path d="M4 7h9M11 7a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
      <path d="M20 17h-9M13 17a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </>
  ),
  dados: (
    <>
      <path d="M4 19V5M20 19H4M8 16v-4M12 16V8M16 16v-6" />
    </>
  ),
  conteudo: (
    <>
      <path d="M4 5.5 12 3l8 2.5-8 2.5-8-2.5Z" />
      <path d="M4 11.5 12 14l8-2.5M4 17.5 12 20l8-2.5" />
    </>
  ),
  evolucao: <path d="M4 16l5-5 3.5 3.5L20 7M20 7h-5M20 7v5" />,
  relacionamento: (
    <>
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
    </>
  ),
  documentacao: (
    <>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5M10 13h6M10 17h6" />
    </>
  ),
  check: <path d="M4 12.5 9 17.5 20 6.5" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />,
  "folder-open": (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2" />
      <path d="M3 9.5h18.5L19.5 19a1.6 1.6 0 0 1-1.5 1H4.5A1.6 1.6 0 0 1 3 18.4V9.5Z" />
    </>
  ),
  spark: <path d="M12 3v6M12 15v6M3 12h6M15 12h6M6.3 6.3l3 3M14.7 14.7l3 3M17.7 6.3l-3 3M9.3 14.7l-3 3" />,
  node: (
    <>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="9" />
    </>
  ),
};

type IconProps = SVGProps<SVGSVGElement> & { name: IconName; size?: number };

export function Icon({ name, size = 20, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
