import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { DiagnosticoForm } from "@/components/DiagnosticoForm";

export const metadata: Metadata = {
  title: "Diagnóstico Digital Noryos",
  description:
    "Solicite uma avaliação inicial da presença digital, aquisição e automação da sua empresa. Sem cadastro, sem compromisso.",
  alternates: { canonical: "/diagnostico" },
};

export default function DiagnosticoPage() {
  return (
    <section className="py-20">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <SectionLabel>Diagnóstico Digital Noryos</SectionLabel>
          <h1 className="text-3xl font-medium sm:text-4xl">
            Descubra onde sua operação digital pode melhorar.
          </h1>
          <p className="mt-5 text-[var(--color-text-muted)]">
            Cinco etapas curtas sobre sua empresa, presença digital, aquisição de clientes, atendimento e
            objetivos. Sem criar conta, sem compromisso.
          </p>
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            Isso não gera um relatório automático — as respostas são analisadas e usadas pra te dar um retorno real
            sobre o que faz sentido priorizar, ou pra dizer com honestidade que ainda não é o momento certo.
          </p>
        </div>
        <DiagnosticoForm />
      </Container>
    </section>
  );
}
