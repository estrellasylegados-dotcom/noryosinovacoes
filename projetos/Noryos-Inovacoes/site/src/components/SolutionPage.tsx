import { Container } from "./ui/Container";
import { SectionLabel } from "./ui/SectionLabel";
import { WhatsappCTA } from "./WhatsappCTA";
import { ButtonLink } from "./ui/Button";
import { SectionReveal, Stagger } from "./ui/motion";
import { SpotlightCard } from "./ui/SpotlightCard";
import { staggerIndex } from "@/lib/motion";
import type { SolucaoDetalhe } from "@/content/solucoes-detalhe";

/**
 * Estrutura de marketing direto (seção 42 do briefing) — usada só nas
 * páginas de solução, não na Home. Home vende a Noryos; isto vende a
 * solução específica.
 */
export function SolutionPage({ data }: { data: SolucaoDetalhe }) {
  return (
    <>
      <section className="hero-bleed tech-grid glow-cyan relative overflow-hidden border-b border-[var(--hairline)] pb-16 pt-[calc(var(--header-h)+72px)]">
        <Container>
          <SectionLabel>{data.nome}</SectionLabel>
          <h1 className="t-display max-w-3xl text-[clamp(2.25rem,1.6rem+2.6vw,3.4rem)]">{data.titulo}</h1>
          <p className="mt-6 max-w-2xl t-lead">{data.subtitulo}</p>
          <div className="mt-8">
            <WhatsappCTA>Solicitar diagnóstico</WhatsappCTA>
          </div>
        </Container>
      </section>

      <section className="section">
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionReveal>
            <h2 className="t-h3">O problema</h2>
            <p className="mt-3 text-[var(--color-text-muted)]">{data.problema}</p>
          </SectionReveal>
          <SectionReveal delay={80}>
            <h2 className="t-h3">A oportunidade</h2>
            <p className="mt-3 text-[var(--color-text-muted)]">{data.oportunidade}</p>
          </SectionReveal>
        </Container>
      </section>

      <section className="section surface-1 border-y border-[var(--hairline)]">
        <Container>
          <SectionReveal>
            <h2 className="max-w-2xl t-h3">{data.solucao}</h2>
          </SectionReveal>
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-3">
            {data.mecanismo.map((item, i) => (
              <SpotlightCard key={item.titulo} className="p-6">
                <div data-anim="fade-up" style={staggerIndex(i)}>
                  <h3 className="font-medium tracking-tight">{item.titulo}</h3>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">{item.descricao}</p>
                </div>
              </SpotlightCard>
            ))}
          </Stagger>
        </Container>
      </section>

      <section className="section">
        <Container>
          <SectionLabel>Cenário demonstrativo</SectionLabel>
          <p className="mb-8 max-w-xl text-sm text-[var(--color-text-muted)]">
            Hipotético, pra ilustrar o processo — não um case real nem um resultado obtido.
          </p>
          <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-4">
            {[
              { t: "Situação", d: data.demonstracao.situacao },
              { t: "Solução", d: data.demonstracao.solucao },
              { t: "Estrutura", d: data.demonstracao.estrutura },
              { t: "Resultado esperado", d: data.demonstracao.resultadoEsperado },
            ].map((card) => (
              <div key={card.t} className="bg-[var(--color-surface-1)] p-6">
                <h3 className="font-medium tracking-tight">{card.t}</h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{card.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section surface-1 border-y border-[var(--hairline)]">
        <Container className="max-w-2xl">
          <h2 className="t-h3">Objeções comuns</h2>
          <div className="mt-6 grid gap-6">
            {data.objecoes.map((item, i) => (
              <SectionReveal key={item.pergunta} delay={i * 50}>
                <p className="font-medium tracking-tight">{item.pergunta}</p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{item.resposta}</p>
              </SectionReveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-impact text-center">
        <Container className="max-w-xl">
          <h2 className="t-h2">Vamos ver se {data.nome.toLowerCase()} faz sentido pro seu momento?</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <WhatsappCTA>Conversar sobre meu projeto</WhatsappCTA>
            <ButtonLink href="/diagnostico" variant="secondary" withArrow>
              Solicitar diagnóstico
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
