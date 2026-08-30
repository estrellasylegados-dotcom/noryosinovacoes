import Link from "next/link";
import Image from "next/image";
import { Container } from "./ui/Container";
import { navegacaoFooter } from "@/content/navegacao";
import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-[var(--hairline)] surface-1">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center" aria-label={`${siteConfig.name} — página inicial`}>
            <Image
              src="/noryos-logo.png"
              alt={siteConfig.name}
              width={2172}
              height={724}
              className="h-9 w-auto md:h-10"
            />
          </Link>
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">{siteConfig.description}</p>
          <p className="mt-4 font-mono text-xs uppercase tracking-wider text-[var(--color-text-dim)]">
            {siteConfig.atendimento}
          </p>
        </div>

        <nav aria-label="Navegação do rodapé">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-dim)]">
            Navegação
          </span>
          <ul className="mt-4 grid gap-3 text-sm">
            {navegacaoFooter.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-dim)]">
            Contato
          </span>
          <p className="mt-4 text-sm">
            <a href={`mailto:${siteConfig.email}`} className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]">
              {siteConfig.email}
            </a>
          </p>
        </div>
      </Container>

      <div className="border-t border-[var(--hairline)]">
        <Container className="flex flex-col gap-2 py-6 text-xs text-[var(--color-text-dim)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <p>{siteConfig.domain}</p>
        </Container>
      </div>
    </footer>
  );
}
