import Link from "next/link";
import { Container } from "./ui/Container";
import { navegacaoFooter } from "@/content/navegacao";
import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] py-14">
      <Container className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Link href="/" className="font-[family-name:var(--font-display)] text-lg font-semibold">
            {siteConfig.shortName}
            <span className="text-[var(--color-cyan)]">.</span>
          </Link>
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">{siteConfig.description}</p>
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">{siteConfig.atendimento}</p>
        </div>

        <nav aria-label="Navegação do rodapé">
          <ul className="grid gap-3 text-sm">
            {navegacaoFooter.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-sm text-[var(--color-text-muted)]">
          <p>
            <a href={`mailto:${siteConfig.email}`} className="hover:text-[var(--color-text)]">
              {siteConfig.email}
            </a>
          </p>
          <p className="mt-4">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </Container>
    </footer>
  );
}
