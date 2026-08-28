"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "./ui/Container";
import { WhatsappCTA } from "./WhatsappCTA";
import { navegacaoPrincipal } from "@/content/navegacao";
import { siteConfig } from "@/lib/config";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-ink)]/90 backdrop-blur-md">
      <Container className="flex h-18 items-center justify-between py-4">
        <Link href="/" className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          {siteConfig.shortName}
          <span className="text-[var(--color-cyan)]">.</span>
        </Link>

        <nav className="hidden gap-8 md:flex" aria-label="Navegação principal">
          {navegacaoPrincipal.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <WhatsappCTA variant="primary" className="!px-5 !py-2.5 text-sm">
            Conversar sobre meu projeto
          </WhatsappCTA>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden>{open ? "✕" : "☰"}</span>
        </button>
      </Container>

      {open && (
        <div className="border-t border-[var(--color-border)] md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navegacaoPrincipal.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[var(--radius-sm)] px-2 py-3 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-card)] hover:text-[var(--color-text)]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2">
              <WhatsappCTA variant="primary" className="w-full">
                Conversar sobre meu projeto
              </WhatsappCTA>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
