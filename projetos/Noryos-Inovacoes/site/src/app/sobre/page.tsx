import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { WhatsappCTA } from "@/components/WhatsappCTA";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Sobre a Noryos",
  description: "Como a Noryos Inovações pensa tecnologia, operação digital e crescimento de empresas.",
  alternates: { canonical: "/sobre" },
};

export default function SobrePage() {
  return (
    <>
      <section className="border-b border-[var(--color-border)] py-20">
        <Container className="max-w-3xl">
          <SectionLabel>Sobre a Noryos</SectionLabel>
          <h1 className="text-3xl font-medium sm:text-4xl">Uma estrutura pensada para durar.</h1>
          <p className="mt-6 text-lg text-[var(--color-text-muted)]">
            A Noryos Inovações nasce como uma empresa de soluções digitais e tecnologia — não como mais uma agência
            de posts e anúncios. A proposta é organizar e acelerar a operação digital de empresas pequenas e
            médias, conectando presença digital, aquisição e automação numa mesma estrutura.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-10 max-w-3xl">
          <Reveal>
            <h2 className="text-xl font-medium">Empresa nova. O jeito de trabalhar, não.</h2>
            <p className="mt-3 text-[var(--color-text-muted)]">
              A Noryos está começando agora — e isso é dito com transparência, sem case inflado ou depoimento
              fabricado pra parecer maior do que é. O que já existe antes do primeiro projeto fechado é a
              metodologia: o Noryos OS, a forma como cada projeto é estruturado, documentado e preparado para
              evoluir.
            </p>
          </Reveal>
          <Reveal delay={70}>
            <h2 className="text-xl font-medium">Por trás da Noryos</h2>
            <p className="mt-3 text-[var(--color-text-muted)]">
              A Noryos é conduzida por Rafael Viriato, responsável direto por cada projeto — sem repasse pra uma
              fila de atendentes diferentes a cada mês. Isso significa contato direto com quem está de fato tocando
              o seu projeto.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <h2 className="text-xl font-medium">O que a Noryos não faz</h2>
            <p className="mt-3 text-[var(--color-text-muted)]">
              Não promete resultado milagroso, não usa cliente fictício como prova social e não empurra pacote
              fechado de serviços que a empresa não precisa. Cada solução entra na conversa quando faz sentido pra
              prioridade real do negócio.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-ink-secondary)] py-16 text-center">
        <Container>
          <h2 className="text-xl font-medium">Quer entender se faz sentido pro seu momento?</h2>
          <div className="mt-6 flex justify-center">
            <WhatsappCTA>Conversar sobre meu projeto</WhatsappCTA>
          </div>
        </Container>
      </section>
    </>
  );
}
