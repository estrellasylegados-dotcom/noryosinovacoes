import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { DiagnosticoForm } from "@/components/DiagnosticoForm";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Diagnóstico Digital Noryos",
  description:
    "Solicite uma avaliação inicial da presença digital, aquisição e automação da sua empresa. Sem cadastro, sem compromisso.",
  alternates: { canonical: "/diagnostico" },
};

export default function DiagnosticoPage() {
  return (
    <section className="section">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Reveal>
          <SectionLabel>Diagnóstico Digital Noryos</SectionLabel>
          <h1 className="t-display text-[clamp(2.25rem,1.6rem+2.6vw,3.4rem)]">
            Descubra onde sua operação digital pode melhorar.
          </h1>
          <p className="mt-6 t-lead">
            Cinco etapas curtas sobre sua empresa, presença digital, aquisição de clientes, atendimento e
            objetivos. Sem criar conta, sem compromisso.
          </p>
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            Isso não gera um relatório automático — as respostas são analisadas e usadas pra te dar um retorno real
            sobre o que faz sentido priorizar, ou pra dizer com honestidade que ainda não é o momento certo.
          </p>
        </Reveal>
        <DiagnosticoForm />
      </Container>
    </section>
  );
}
