"use client";

import { useState } from "react";
import { FaqItem } from "@/content/faq";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.pergunta}>
            <button
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
            >
              <span className="font-medium">{item.pergunta}</span>
              <span className="text-xl text-[var(--color-text-muted)]" aria-hidden>
                {isOpen ? "–" : "+"}
              </span>
            </button>
            <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
              <div className="overflow-hidden">
                <p className="pb-5 pr-8 text-sm text-[var(--color-text-muted)]">{item.resposta}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
