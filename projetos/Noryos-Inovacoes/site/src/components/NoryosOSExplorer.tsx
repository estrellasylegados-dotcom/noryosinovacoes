"use client";

import { CSSProperties, KeyboardEvent, useRef, useState } from "react";
import { useInView } from "@/lib/hooks";
import { Icon } from "@/components/ui/Icon";
import { noryosOSModules as MODS } from "@/content/noryos-os";

/**
 * §16/§17 — o Noryos OS como um workspace operacional: não pastas girando,
 * não o Explorer do Windows. Uma janela com as frentes de trabalho em
 * módulos; ao selecionar um, ele assume foco, "abre" e mostra 2–4 itens
 * internos, os outros recuam. Um indicador desliza; tudo pertence ao mesmo
 * sistema. Só a abstração comercial do método — nunca a estrutura real.
 *
 * Desktop: tablist (indicador desliza, conteúdo entra com stagger curto).
 * Mobile: accordion (targets grandes, sem hover). reduced-motion: troca
 * seca. Nenhum translate horizontal (o overflow antigo de ~4px sai daqui).
 */

export function NoryosOSExplorer() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [sel, setSel] = useState(0);
  const tablistRef = useRef<HTMLDivElement>(null);
  const idx = sel < 0 ? 0 : sel;
  const active = MODS[idx];

  const onTabsKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    let next = idx;
    if (e.key === "ArrowRight") next = (idx + 1) % MODS.length;
    if (e.key === "ArrowLeft") next = (idx - 1 + MODS.length) % MODS.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = MODS.length - 1;
    setSel(next);
    tablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <div
      ref={ref}
      data-anim="scale-in"
      className={`osx panel overflow-hidden ${inView ? "is-in" : ""}`}
    >
      <div className="osx-chrome">
        <span className="osx-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="osx-title">NORYOS OS</span>
        <span className="osx-state" aria-hidden>
          <i className="live-dot" />
          <span>operando</span>
        </span>
      </div>

      {/* desktop: tabs + painel */}
      <div className="osx-desktop hidden md:block" style={{ "--sel": idx } as CSSProperties}>
        <div
          ref={tablistRef}
          role="tablist"
          aria-label="Frentes do Noryos OS"
          className="osx-tabs"
          onKeyDown={onTabsKey}
        >
          {MODS.map((m, i) => (
            <button
              key={m.nome}
              type="button"
              role="tab"
              id={`osx-tab-${i}`}
              aria-selected={idx === i}
              aria-controls="osx-panel"
              tabIndex={idx === i ? 0 : -1}
              className="osx-tab"
              onClick={() => setSel(i)}
            >
              <Icon name={m.icon} size={16} aria-hidden />
              <span>{m.nome}</span>
            </button>
          ))}
          <span className="osx-rail" aria-hidden>
            <span className="osx-rail-node" />
          </span>
        </div>

        <div
          role="tabpanel"
          id="osx-panel"
          aria-labelledby={`osx-tab-${idx}`}
          tabIndex={0}
          key={idx}
          className="osx-panel"
        >
          <div className="osx-panel-head">
            <h3 className="osx-name">{active.nome}</h3>
            <span className="osx-tag" aria-hidden>
              frente {idx + 1}/{MODS.length}
            </span>
          </div>
          <p className="osx-desc">{active.descricao}</p>
          <ul className="osx-items">
            {active.itens.map((it, i) => (
              <li key={it} className="osx-item" style={{ "--i": i } as CSSProperties}>
                {it}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* mobile: accordion — usa `sel` cru (não o `idx` fixado em 0 do
          desktop), pra permitir recolher todas as frentes */}
      <div className="osx-mobile md:hidden">
        {MODS.map((m, i) => {
          const open = sel === i;
          return (
            <div key={m.nome} className="osx-acc" data-open={open || undefined}>
              <h3 className="osx-acc-h">
                <button
                  type="button"
                  className="osx-acc-head"
                  id={`osx-acc-head-${i}`}
                  aria-expanded={open}
                  aria-controls={`osx-acc-panel-${i}`}
                  onClick={() => setSel(open ? -1 : i)}
                >
                  <Icon name={m.icon} size={17} className="osx-acc-icon" aria-hidden />
                  <span className="osx-acc-name">{m.nome}</span>
                  <Icon name="chevron" size={14} className="osx-acc-chev" aria-hidden />
                </button>
              </h3>
              <div
                className="osx-acc-wrap"
                id={`osx-acc-panel-${i}`}
                role="region"
                aria-labelledby={`osx-acc-head-${i}`}
              >
                <div className="osx-acc-inner">
                  <div className="osx-acc-pad">
                    <p className="osx-desc">{m.descricao}</p>
                    <ul className="osx-items">
                      {m.itens.map((it, k) => (
                        <li key={it} className="osx-item" style={{ "--i": k } as CSSProperties}>
                          {it}
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

      <p className="osx-foot">Tudo registrado e conectado no mesmo Noryos OS — um por projeto.</p>
    </div>
  );
}
