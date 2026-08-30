"use client";

import { CSSProperties, useState } from "react";
import { useInView } from "@/lib/hooks";
import { Icon } from "@/components/ui/Icon";
import { noryosOSFolders } from "@/content/noryos-os";

/**
 * §16/§17 — o Noryos OS apresentado como um software proprietário, não um
 * accordion e não o Explorer do Windows. Janela com chrome, árvore de
 * categorias que abre/fecha, e um painel contextual que reage à seleção.
 * Só a abstração comercial do método — nunca a estrutura real interna.
 */
/** Indicador de estado do painel (§12) — ciano/verde, uso moderado. */
const STATUS = ["Organizado", "Conectado", "Documentado"] as const;

export function NoryosOSExplorer() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selected, setSelected] = useState(0);
  const active = noryosOSFolders[selected];

  return (
    <div
      ref={ref}
      data-anim="scale-in"
      className={`panel overflow-hidden ${inView ? "is-in" : ""}`}
    >
      {/* chrome */}
      <div className="flex items-center gap-3 border-b border-[var(--hairline)] bg-[var(--color-surface-1)] px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-text-dim)]/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-text-dim)]/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-text-dim)]/50" />
        </div>
        <span className="font-mono text-xs tracking-[0.2em] text-[var(--color-text-muted)]">NORYOS OS</span>
        <span className="ml-auto flex items-center gap-2 font-mono text-[10px] text-[var(--color-text-dim)]">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-[var(--color-green)]" aria-hidden />
          <span className="hidden sm:inline">ativo</span>
        </span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        {/* árvore */}
        <div className="border-b border-[var(--hairline)] p-2 lg:border-b-0 lg:border-r">
          <ul className="grid gap-0.5">
            {noryosOSFolders.map((folder, index) => {
              const isOpen = openIndex === index;
              const isSel = selected === index;
              return (
                <li
                  key={folder.nome}
                  data-anim="fade-left"
                  data-selected={isSel}
                  className={`tree-item ${inView ? "is-in" : ""}`}
                  style={{ "--anim-delay": `${index * 55}ms` } as CSSProperties}
                >
                  <button
                    type="button"
                    className={`flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2.5 text-left transition-colors duration-200 ${
                      isSel
                        ? "bg-[var(--color-surface-3)] text-[var(--color-text)]"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
                    }`}
                    aria-expanded={isOpen}
                    onClick={() => {
                      setSelected(index);
                      setOpenIndex(isOpen ? null : index);
                    }}
                  >
                    <Icon
                      name="chevron"
                      size={14}
                      className="shrink-0 text-[var(--color-text-dim)] transition-transform duration-200"
                      style={{ transform: isOpen ? "rotate(90deg)" : "none" }}
                    />
                    <Icon
                      name={isOpen ? "folder-open" : "folder"}
                      size={16}
                      className={`shrink-0 ${isSel ? "text-[var(--color-cyan)]" : ""}`}
                    />
                    <span className="text-sm font-medium tracking-tight">{folder.nome}</span>
                  </button>

                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <ul className="ml-[26px] grid gap-1.5 border-l border-[var(--hairline)] py-2 pl-4">
                        {folder.itens.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
                            <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--color-cyan)]" aria-hidden />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* painel contextual — troca com fade + slide a cada seleção */}
        <div className="p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-dim)]">
              Categoria selecionada
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--color-text-dim)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-green)]" aria-hidden />
              {STATUS[selected % STATUS.length]}
            </span>
          </div>
          <div key={selected} className="panel-swap">
            <h3 className="t-h3 mt-2 text-[1.15rem] text-[var(--color-text)]">{active.nome}</h3>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{active.descricao}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {active.itens.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[var(--hairline-strong)] bg-[var(--color-surface-2)] px-2.5 py-1 text-xs text-[var(--color-text-muted)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-6 border-t border-[var(--hairline)] pt-4 font-mono text-[11px] text-[var(--color-text-dim)]">
            organizado no Noryos OS do seu projeto
          </p>
        </div>
      </div>
    </div>
  );
}
