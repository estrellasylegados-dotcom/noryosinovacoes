import { Container } from "./ui/Container";
import { SectionLabel } from "./ui/SectionLabel";
import { WhatsappCTA } from "./WhatsappCTA";
import { ButtonLink } from "./ui/Button";
import { Icon } from "./ui/Icon";
import { SectionReveal, Stagger } from "./ui/motion";
import { SpotlightCard } from "./ui/SpotlightCard";
import { staggerIndex } from "@/lib/motion";
import { whatsappMessages } from "@/lib/config";
import type { SolucaoDetalhe } from "@/content/solucoes-detalhe";

/**
 * Aprofundamento comercial de uma solução (não é a Home, não é página
 * técnica). CTA primário sempre WhatsApp com mensagem contextual da
 * solução; Diagnóstico Digital como secundário. Sem preço, sem promessa
 * de resultado.
 */
export function SolutionPage({ data }: { data: SolucaoDetalhe }) {
  const msg = whatsappMessages[data.whatsapp];

  return (
    <>
      <section className="hero-bleed tech-grid glow-cyan relative overflow-hidden border-b border-[var(--hairline)] pb-16 pt-[calc(var(--header-h)+72px)]">
        <Container>
          <SectionLabel>{data.nome}</SectionLabel>
          <h1 className="t-display max-w-3xl text-[clamp(2.25rem,1.6rem+2.6vw,3.4rem)]">{data.titulo}</h1>
          <p className="mt-6 max-w-2xl t-lead">{data.subtitulo}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <WhatsappCTA message={msg}>Conversar sobre meu projeto</WhatsappCTA>
            <ButtonLink href="/diagnostico" variant="secondary" withArrow>
              Fazer Diagnóstico Digital
            </ButtonLink>
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
          <SectionReveal className="max-w-2xl">
            <SectionLabel>O que pode entrar no projeto</SectionLabel>
            <p className="text-sm text-[var(--color-text-muted)]">
              Conforme o escopo definido na reunião — nem toda empresa precisa de tudo.
            </p>
          </SectionReveal>
          <Stagger className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.entregas.map((entrega, i) => (
              <div
                key={entrega}
                data-anim="fade-up"
                style={staggerIndex(i)}
                className="flex gap-2.5 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--color-surface-1)] p-4 text-sm text-[var(--color-text-muted)]"
              >
                <Icon name="check" size={15} className="mt-0.5 shrink-0 text-[var(--color-green)]" />
                {entrega}
              </div>
            ))}
          </Stagger>
        </Container>
      </section>

      <section className="section surface-1 border-y border-[var(--hairline)]">
        <Container>
          <SectionLabel>Cenário demonstrativo</SectionLabel>
          <p className="mb-8 max-w-xl text-sm text-[var(--color-text-muted)]">
            Hipotético, para ilustrar o processo — não um case real nem um resultado obtido.
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

      <section className="section">
        <Container className="max-w-2xl">
          <h2 className="t-h3">Perguntas comuns</h2>
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
            <WhatsappCTA message={msg}>Conversar sobre meu projeto</WhatsappCTA>
            <ButtonLink href="/diagnostico" variant="secondary" withArrow>
              Fazer Diagnóstico Digital
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
