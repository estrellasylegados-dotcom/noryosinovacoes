import { Container } from "./ui/Container";
import { SectionLabel } from "./ui/SectionLabel";
import { WhatsappCTA } from "./WhatsappCTA";
import { ButtonLink } from "./ui/Button";
import type { SolucaoDetalhe } from "@/content/solucoes-detalhe";

/**
 * Estrutura de marketing direto (seção 42 do briefing) — usada só nas
 * páginas de solução, não na Home. Home vende a Noryos; isto vende a
 * solução específica.
 */
export function SolutionPage({ data }: { data: SolucaoDetalhe }) {
  return (
    <>
      <section className="border-b border-[var(--color-border)] py-20">
        <Container>
          <SectionLabel>{data.nome}</SectionLabel>
          <h1 className="max-w-2xl text-3xl font-medium sm:text-4xl">{data.titulo}</h1>
          <p className="mt-5 max-w-2xl text-[var(--color-text-muted)]">{data.subtitulo}</p>
          <div className="mt-8">
            <WhatsappCTA>Solicitar diagnóstico</WhatsappCTA>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-medium">O problema</h2>
            <p className="mt-3 text-[var(--color-text-muted)]">{data.problema}</p>
          </div>
          <div>
            <h2 className="text-xl font-medium">A oportunidade</h2>
            <p className="mt-3 text-[var(--color-text-muted)]">{data.oportunidade}</p>
          </div>
        </Container>
      </section>

      <section className="border-y border-[var(--color-border)] bg-[var(--color-ink-secondary)] py-16">
        <Container>
          <h2 className="max-w-2xl text-xl font-medium">{data.solucao}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {data.mecanismo.map((item) => (
              <div key={item.titulo} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-6">
                <h3 className="font-medium">{item.titulo}</h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{item.descricao}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionLabel>Cenário demonstrativo</SectionLabel>
          <p className="mb-8 max-w-xl text-sm text-[var(--color-text-muted)]">
            Hipotético, pra ilustrar o processo — não um case real nem um resultado obtido.
          </p>
          <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-4">
            {[
              { t: "Situação", d: data.demonstracao.situacao },
              { t: "Solução", d: data.demonstracao.solucao },
              { t: "Estrutura", d: data.demonstracao.estrutura },
              { t: "Resultado esperado", d: data.demonstracao.resultadoEsperado },
            ].map((card) => (
              <div key={card.t} className="bg-[var(--color-ink)] p-6">
                <h3 className="font-medium">{card.t}</h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{card.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border)] py-16">
        <Container className="max-w-2xl">
          <h2 className="text-xl font-medium">Objeções comuns</h2>
          <div className="mt-6 grid gap-6">
            {data.objecoes.map((item) => (
              <div key={item.pergunta}>
                <p className="font-medium">{item.pergunta}</p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{item.resposta}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-ink-secondary)] py-20 text-center">
        <Container className="max-w-xl">
          <h2 className="text-2xl font-medium">Vamos ver se {data.nome.toLowerCase()} faz sentido pro seu momento?</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <WhatsappCTA>Conversar sobre meu projeto</WhatsappCTA>
            <ButtonLink href="/diagnostico" variant="secondary">
              Solicitar diagnóstico
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
