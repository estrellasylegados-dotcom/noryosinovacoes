import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { WhatsappCTA } from "@/components/WhatsappCTA";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Noryos Inovações sobre o seu projeto.",
  alternates: { canonical: "/contato" },
};

export default function ContatoPage() {
  return (
    <section className="py-20">
      <Container className="max-w-2xl text-center">
        <Reveal>
          <SectionLabel>Contato</SectionLabel>
          <h1 className="text-3xl font-medium sm:text-4xl">Vamos conversar sobre o seu projeto?</h1>
          <p className="mt-5 text-[var(--color-text-muted)]">
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
        </Reveal>
      </Container>
    </section>
  );
}
