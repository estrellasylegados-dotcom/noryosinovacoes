"use client";

import { useState } from "react";
import { noryosOSFolders } from "@/content/noryos-os";

/**
 * Interface tipo "explorer" pra apresentar o Noryos OS — não deve parecer
 * Windows Explorer, e sim um produto digital: cards que expandem, ícone
 * de pasta discreto, transição suave. Só a abstração comercial do método,
 * nunca a estrutura real do noryosinovacoes_OS interno.
 */
export function NoryosOSExplorer() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="grid gap-3">
      {noryosOSFolders.map((folder, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={folder.nome}
            className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] transition-colors hover:border-[var(--color-border-strong)]"
          >
            <button
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-3">
                <FolderIcon open={isOpen} />
                <span className="font-medium">{folder.nome}</span>
              </span>
              <span
                className="text-[var(--color-text-muted)] transition-transform duration-200"
                style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                aria-hidden
              >
                ›
              </span>
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="border-t border-[var(--color-border)] px-5 py-4 pl-12">
                  <p className="text-sm text-[var(--color-text-muted)]">{folder.descricao}</p>
                  <ul className="mt-3 grid gap-2">
                    {folder.itens.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                        <span className="h-1 w-1 rounded-full bg-[var(--color-cyan)]" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FolderIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M2 4.5C2 3.67 2.67 3 3.5 3H7l1.5 2H14.5c.83 0 1.5.67 1.5 1.5V13.5c0 .83-.67 1.5-1.5 1.5h-11C2.67 15 2 14.33 2 13.5V4.5Z"
        stroke={open ? "var(--color-cyan)" : "var(--color-text-muted)"}
        strokeWidth="1.3"
      />
    </svg>
  );
}
