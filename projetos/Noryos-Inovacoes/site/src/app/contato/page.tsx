import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { WhatsappCTA } from "@/components/WhatsappCTA";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig, whatsappDisplay } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Noryos Inovações sobre o seu projeto.",
  alternates: { canonical: "/contato" },
};

export default function ContatoPage() {
  return (
    <section className="section-impact">
      <Container className="max-w-2xl text-center">
        <Reveal>
          <SectionLabel>Contato</SectionLabel>
          <h1 className="t-display text-[clamp(2.25rem,1.6rem+2.6vw,3.4rem)]">Vamos conversar sobre o seu projeto?</h1>
          <p className="mt-6 t-lead">
            Conte o que já tentou e o que precisa dar certo. A resposta é direta — mesmo quando é &ldquo;ainda não é a
            hora&rdquo;.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <WhatsappCTA>Conversar sobre meu projeto</WhatsappCTA>
            <ButtonLink href={`mailto:${siteConfig.email}`} variant="secondary">
              {siteConfig.email}
            </ButtonLink>
          </div>
          <p className="mt-10 text-sm text-[var(--color-text-muted)]">{siteConfig.atendimento}</p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-dim)]">
            Atendimento comercial: {whatsappDisplay}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
