import type { CSSProperties } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsappCTA } from "@/components/WhatsappCTA";
import { HeroSystemAnimation } from "@/components/HeroSystemAnimation";
import { NoryosOSExplorer } from "@/components/NoryosOSExplorer";
import { FaqAccordion } from "@/components/FaqAccordion";
import { servicos } from "@/content/servicos";
import { faq } from "@/content/faq";
import { faqJsonLd, jsonLdScript } from "@/lib/seo";

export default function HomePage() {
  const [principal, ...secundarios] = servicos;

  return (
    <>
      {/* 1. HERO */}
      <section className="tech-grid-bg relative overflow-hidden border-b border-[var(--color-border)] pb-20 pt-24 sm:pt-32">
        <Container className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="hero-rise">
              <SectionLabel>Noryos Inovações</SectionLabel>
            </div>
            <h1
              className="hero-rise max-w-xl text-4xl font-medium leading-[1.08] sm:text-5xl lg:text-[3.4rem]"
              style={{ "--rise-delay": "80ms" } as CSSProperties}
            >
              Tecnologia que conecta estratégia, operação e crescimento.
            </h1>
            <p
              className="hero-rise mt-6 max-w-lg text-lg text-[var(--color-text-muted)]"
              style={{ "--rise-delay": "160ms" } as CSSProperties}
            >
              A Noryos combina presença digital, aquisição e automação para construir operações mais organizadas,
              eficientes e preparadas para crescer.
            </p>
            <div
              className="hero-rise mt-9 flex flex-wrap gap-4"
              style={{ "--rise-delay": "240ms" } as CSSProperties}
            >
              <WhatsappCTA>Conversar sobre meu projeto</WhatsappCTA>
              <ButtonLink href="/solucoes" variant="secondary">
                Conhecer as soluções
              </ButtonLink>
            </div>
          </div>
          <div
            className="hero-rise relative mx-auto aspect-[4/3] w-full max-w-md"
            style={{ "--rise-delay": "320ms" } as CSSProperties}
          >
            <HeroSystemAnimation />
          </div>
        </Container>
      </section>

      {/* 2. PROBLEMA */}
      <section className="py-24">
        <Container>
          <Reveal>
            <SectionLabel>O ponto de partida</SectionLabel>
            <h2 className="max-w-2xl text-2xl font-medium sm:text-3xl">
              Operação digital fragmentada custa mais caro do que parece.
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Site sem estratégia",
                "Anúncios desconectados",
                "Leads espalhados",
                "Processos manuais",
              ].map((item, i) => (
                <Reveal
                  key={item}
                  delay={i * 60}
                  className="card-lift rounded-[var(--radius-md)] border border-[var(--color-border)] px-5 py-6 text-sm text-[var(--color-text-muted)]"
                >
                  {item}
                </Reveal>
              ))}
            </div>
            <p className="mt-8 text-xl font-medium text-[var(--color-text)]">
              A soma disso é sempre a mesma: mais esforço, menos controle.
            </p>
            <p className="mt-3 text-[var(--color-text-muted)]">A Noryos conecta essas partes.</p>
          </Reveal>
        </Container>
      </section>

      {/* 3. NOVA POSSIBILIDADE */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-ink-secondary)] py-24">
        <Container>
          <Reveal className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionLabel>Uma forma diferente de olhar pra isso</SectionLabel>
              <h2 className="text-2xl font-medium sm:text-3xl">A operação digital pode funcionar como sistema.</h2>
              <p className="mt-5 max-w-md text-[var(--color-text-muted)]">
                Em vez de contratar peças soltas — um site aqui, um anúncio ali — a Noryos estrutura presença,
                aquisição e automação como partes conectadas de uma mesma operação, com dado real orientando cada
                ajuste.
              </p>
            </div>
            <ol className="grid gap-3">
              {["Presença Digital", "Aquisição", "Relacionamento", "Automação", "Dados", "Evolução"].map((item, i) => (
                <Reveal
                  key={item}
                  as="li"
                  delay={i * 55}
                  className="card-lift flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-5 py-4"
                >
                  <span className="font-[family-name:var(--font-display)] text-sm text-[var(--color-cyan)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm">{item}</span>
                </Reveal>
              ))}
            </ol>
          </Reveal>
        </Container>
      </section>

      {/* 4. SOLUÇÕES */}
      <section id="solucoes" className="py-24">
        <Container>
          <Reveal>
            <SectionLabel>O que a Noryos entrega</SectionLabel>
            <h2 className="max-w-xl text-2xl font-medium sm:text-3xl">Soluções para diferentes etapas do seu negócio</h2>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Reveal className="card-lift rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-8">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-cyan)]">
                {principal.tag}
              </span>
              <h3 className="mt-3 text-2xl font-medium">{principal.titulo}</h3>
              <p className="mt-4 text-[var(--color-text-muted)]">{principal.problema}</p>
              <p className="mt-4 text-[var(--color-text)]">{principal.solucao}</p>
              {principal.href && (
                <ButtonLink href={principal.href} variant="secondary" className="mt-6">
                  Ver Presença Digital
                </ButtonLink>
              )}
            </Reveal>

            <Reveal className="flex flex-col gap-4">
              {secundarios.map((servico) => (
                <div
                  key={servico.slug}
                  className="card-lift rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-6"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-green)]">
                    {servico.tag}
                  </span>
                  <h4 className="mt-2 font-medium">{servico.titulo}</h4>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">{servico.beneficio}</p>
                  {servico.href && (
                    <ButtonLink href={servico.href} variant="ghost" className="mt-3 !px-0 !py-0">
                      Ver solução →
                    </ButtonLink>
                  )}
                </div>
              ))}
            </Reveal>
          </div>
        </Container>
      </section>

      {/* 5. DIAGNÓSTICO NA HOME */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-ink-secondary)] py-24">
        <Container className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <Reveal>
            <SectionLabel>Diagnóstico Digital Noryos</SectionLabel>
            <h2 className="max-w-lg text-2xl font-medium sm:text-3xl">
              Descubra onde sua operação digital pode melhorar.
            </h2>
            <p className="mt-4 max-w-lg text-[var(--color-text-muted)]">
              Uma avaliação inicial sobre site, mobile, presença no Google, conversão, WhatsApp, aquisição e
              automação — pra entender com clareza onde faz sentido investir primeiro.
            </p>
          </Reveal>
          <Reveal>
            <ButtonLink href="/diagnostico" variant="primary">
              Solicitar meu diagnóstico
            </ButtonLink>
          </Reveal>
        </Container>
      </section>

      {/* 6. NORYOS OS */}
      <section className="py-24">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <SectionLabel>A metodologia por trás</SectionLabel>
            <h2 className="text-2xl font-medium sm:text-3xl">Seu projeto não fica solto. Ele nasce organizado.</h2>
            <p className="mt-5 max-w-md text-[var(--color-text-muted)]">
              O Noryos OS é a forma como cada projeto é estruturado — uma base pensada pra durar, com continuidade
              entre presença digital, aquisição, conteúdo, automações, dados e documentação.
            </p>
            <p className="mt-4 max-w-md text-sm text-[var(--color-text-muted)]">
              Clique nas categorias ao lado pra ver o que cada uma organiza.
            </p>
          </Reveal>
          <Reveal>
            <NoryosOSExplorer />
          </Reveal>
        </Container>
      </section>

      {/* 7. COMO TRABALHAMOS */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-ink-secondary)] py-24">
        <Container>
          <Reveal>
            <SectionLabel>Como trabalhamos</SectionLabel>
            <h2 className="max-w-xl text-2xl font-medium sm:text-3xl">Um processo claro, do início ao acompanhamento.</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "01", t: "Entendemos", d: "Conhecemos o negócio, processos e objetivos." },
              { n: "02", t: "Planejamos", d: "Definimos estratégia e solução." },
              { n: "03", t: "Construímos", d: "Desenvolvemos e implementamos." },
              { n: "04", t: "Acompanhamos", d: "Medimos resultados e buscamos melhorias." },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 70} className="border-t border-[var(--color-border-strong)] pt-6">
                <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-cyan)]">{step.n}</span>
                <h3 className="mt-3 font-medium">{step.t}</h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{step.d}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* 8. DEMONSTRAÇÕES */}
      <section className="py-24">
        <Container>
          <Reveal>
            <SectionLabel>Cenário demonstrativo</SectionLabel>
            <h2 className="max-w-xl text-2xl font-medium sm:text-3xl">Como a metodologia se aplicaria na prática</h2>
            <p className="mt-3 max-w-xl text-sm text-[var(--color-text-muted)]">
              A Noryos ainda não tem cases reais publicados — este é um cenário hipotético pra ilustrar como o
              processo funciona, não um resultado obtido.
            </p>
          </Reveal>

          <Reveal className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-4">
            {[
              { t: "Situação", d: "Prestador de serviço local com site antigo, sem experiência mobile e sem canal claro de contato." },
              { t: "Solução", d: "Novo site orientado à conversão, WhatsApp centralizado e Google Business Profile otimizado." },
              { t: "Estrutura", d: "Presença digital + automação de atendimento organizadas dentro do Noryos OS do projeto." },
              { t: "Resultado esperado", d: "Mais visitantes concluindo contato, com resposta mais rápida via automação — a validar com dado real." },
            ].map((card) => (
              <div key={card.t} className="bg-[var(--color-ink)] p-6">
                <h3 className="font-medium">{card.t}</h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{card.d}</p>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* 9. POR QUE NORYOS */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-ink-secondary)] py-24">
        <Container>
          <Reveal>
            <SectionLabel>Por que Noryos</SectionLabel>
            <h2 className="max-w-xl text-2xl font-medium sm:text-3xl">Argumentos concretos, não adjetivos soltos.</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {[
              { t: "Estratégia antes da ferramenta", d: "Primeiro entendemos o problema." },
              { t: "Estrutura antes da entrega", d: "Projetos são organizados para continuidade." },
              { t: "Integração", d: "Marketing, tecnologia e automação trabalhando juntos." },
              { t: "Visibilidade", d: "O cliente entende o que foi construído." },
              { t: "Evolução", d: "Soluções preparadas para crescer." },
            ].map((item, i) => (
              <Reveal key={item.t} delay={i * 60} className="flex gap-4">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-green)]" aria-hidden />
                <div>
                  <h3 className="font-medium">{item.t}</h3>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">{item.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* 10. PROVA / CREDIBILIDADE */}
      <section className="py-24">
        <Container>
          <Reveal>
            <SectionLabel>Credibilidade</SectionLabel>
            <h2 className="max-w-2xl text-2xl font-medium sm:text-3xl">
              A Noryos é nova. Isso a gente fala com transparência, sem inventar case pra parecer maior do que é.
            </h2>
            <p className="mt-5 max-w-2xl text-[var(--color-text-muted)]">
              O que sustenta a credibilidade aqui é o que dá pra verificar agora: o processo, a metodologia do
              Noryos OS, a forma como cada projeto é documentado, e a transparência sobre o que ainda está em
              construção.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* 11. FAQ */}
      <section className="border-t border-[var(--color-border)] py-24">
        <Container className="max-w-3xl">
          <Reveal>
            <SectionLabel>Perguntas frequentes</SectionLabel>
            <h2 className="text-2xl font-medium sm:text-3xl">Antes de conversar, talvez isso já responda</h2>
          </Reveal>
          <Reveal className="mt-10">
            <FaqAccordion items={faq} />
          </Reveal>
        </Container>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faqJsonLd(faq))} />
      </section>

      {/* 12. CTA FINAL */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-ink-secondary)] py-24 text-center">
        <Container className="max-w-2xl">
          <Reveal>
            <h2 className="text-3xl font-medium sm:text-4xl">
              Conte para nós o que hoje está impedindo sua operação digital de avançar.
            </h2>
            <p className="mt-5 text-[var(--color-text-muted)]">
              Primeiro entendemos o cenário. Depois avaliamos como podemos ajudar.
            </p>
            <div className="mt-8 flex justify-center">
              <WhatsappCTA>Conversar sobre meu projeto</WhatsappCTA>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
