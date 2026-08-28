import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsappCTA } from "@/components/WhatsappCTA";
import { Reveal } from "@/components/ui/Reveal";
import { servicos } from "@/content/servicos";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Soluções para diferentes etapas do seu negócio",
  description:
    "Presença digital, automação, aquisição e performance, e conteúdo — soluções conectadas pela metodologia Noryos OS.",
  alternates: { canonical: "/solucoes" },
};

export default function SolucoesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd([
            { nome: "Home", url: siteConfig.url },
            { nome: "Soluções", url: `${siteConfig.url}/solucoes` },
          ])
        )}
      />
      <section className="hero-bleed tech-grid glow-cyan relative overflow-hidden border-b border-[var(--hairline)] pb-16 pt-[calc(var(--header-h)+72px)]">
        <Container>
          <SectionLabel>Soluções</SectionLabel>
          <h1 className="t-display max-w-3xl text-[clamp(2.25rem,1.6rem+2.6vw,3.4rem)]">
            Soluções para diferentes etapas do seu negócio
          </h1>
          <p className="mt-6 max-w-2xl t-lead">
            Cada solução resolve um problema específico — e funciona ainda melhor quando conectada às outras dentro
            da mesma operação.
          </p>
        </Container>
      </section>

      <section className="section">
        <Container className="grid gap-4">
          {servicos.map((servico, i) => (
            <Reveal
              key={servico.slug}
              delay={i * 70}
              className="spotlight-card grid gap-6 p-8 md:grid-cols-[auto_1fr_auto] md:items-center"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-cyan)] md:w-40">
                {servico.tag}
              </span>
              <div>
                <h2 className="text-lg font-medium">{servico.titulo}</h2>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{servico.solucao}</p>
              </div>
              {servico.href ? (
                <ButtonLink href={servico.href} variant="secondary">
                  Ver detalhes
                </ButtonLink>
              ) : (
                <WhatsappCTA variant="secondary">Perguntar sobre isso</WhatsappCTA>
              )}
            </Reveal>
          ))}
        </Container>
      </section>
    </>
  );
}
