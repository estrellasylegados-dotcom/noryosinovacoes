import type { CSSProperties } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsappCTA } from "@/components/WhatsappCTA";
import { SectionReveal, Stagger, Parallax } from "@/components/ui/motion";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { staggerIndex } from "@/lib/motion";
import { SystemCanvas } from "@/components/system/SystemCanvas";
import { FragmentGrid } from "@/components/system/FragmentGrid";
import { SystemFlow } from "@/components/system/SystemFlow";
import { SolutionShowcase } from "@/components/SolutionShowcase";
import { NoryosOSExplorer } from "@/components/NoryosOSExplorer";
import { DiagnosticPreview } from "@/components/DiagnosticPreview";
import { ProcessTimeline } from "@/components/ProcessTimeline";
import { ApplicationScenarios } from "@/components/ApplicationScenarios";
import { FinalCTA } from "@/components/FinalCTA";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Icon } from "@/components/ui/Icon";
import { faq } from "@/content/faq";
import { porQueNoryos, modulosHero } from "@/content/home";
import { faqJsonLd, jsonLdScript } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      {/* 1 — HERO cinematográfico */}
      <section className="hero-bleed tech-grid glow-cyan noise relative flex min-h-[100svh] items-center overflow-hidden border-b border-[var(--hairline)]">
        <Container className="grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-0">
          <div>
            <div className="hero-rise">
              <SectionLabel>Noryos Inovações</SectionLabel>
            </div>
            <AnimatedHeading
              as="h1"
              className="t-display max-w-[16ch]"
              lines={["Tecnologia que conecta", "estratégia, operação", "e crescimento."]}
              accent="crescimento"
            />
            <p
              className="hero-rise t-lead mt-7 max-w-lg"
              style={{ "--rise-delay": "220ms" } as CSSProperties}
            >
              A Noryos combina presença digital, aquisição e automação para construir operações mais organizadas,
              eficientes e preparadas para crescer.
            </p>
            <div
              className="hero-rise mt-9 flex flex-wrap gap-4"
              style={{ "--rise-delay": "320ms" } as CSSProperties}
            >
              <WhatsappCTA>Conversar sobre meu projeto</WhatsappCTA>
              <ButtonLink href="/solucoes" variant="secondary" withArrow>
                Conhecer as soluções
              </ButtonLink>
            </div>
            <div
              className="hero-rise mt-10 flex flex-wrap gap-x-3 gap-y-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-dim)]"
              style={{ "--rise-delay": "400ms" } as CSSProperties}
            >
              {modulosHero.map((m, i) => (
                <span key={m} className="flex items-center gap-3">
                  {i > 0 && <span className="text-[var(--color-text-dim)]/50">/</span>}
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div
            className="hero-rise relative mx-auto aspect-square w-full max-w-[440px] lg:max-w-none"
            style={{ "--rise-delay": "180ms" } as CSSProperties}
          >
            <Parallax strength={26}>
              <SystemCanvas />
            </Parallax>
          </div>
        </Container>
      </section>

      {/* 2 — FRAGMENTAÇÃO */}
      <section className="section">
        <Container>
          <SectionReveal className="max-w-2xl">
            <SectionLabel>O ponto de partida</SectionLabel>
            <AnimatedHeading
              className="t-h2"
              lines={["Operação digital fragmentada", "custa mais caro do que parece."]}
            />
          </SectionReveal>

          <div className="mt-14">
            <FragmentGrid />
          </div>

          <SectionReveal className="mt-12 max-w-xl" delay={60}>
            <p className="text-[var(--color-text)]">
              Quando cada parte trabalha isoladamente, crescer exige mais esforço — e sobra menos controle.
            </p>
            <p className="mt-3 t-lead">A Noryos conecta essas partes.</p>
          </SectionReveal>
        </Container>
      </section>

      {/* 3 — OPERAÇÃO COMO SISTEMA */}
      <section className="section surface-1 border-y border-[var(--hairline)]">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
            <SectionReveal>
              <SectionLabel>Uma forma diferente de olhar pra isso</SectionLabel>
              <AnimatedHeading className="t-h2" lines={["A operação digital pode", "funcionar como sistema."]} />
              <p className="mt-5 max-w-md t-lead">
                Em vez de contratar peças soltas — um site aqui, um anúncio ali — a Noryos estrutura presença,
                aquisição e automação como partes conectadas de uma mesma operação, com dado real orientando cada
                ajuste.
              </p>
            </SectionReveal>
            <SectionReveal delay={100}>
              <SystemFlow />
            </SectionReveal>
          </div>
        </Container>
      </section>

      {/* 4 — SOLUÇÕES */}
      <section id="solucoes" className="section-impact scroll-mt-24">
        <Container className="container-wide">
          <SectionReveal className="max-w-xl">
            <SectionLabel>O que a Noryos entrega</SectionLabel>
            <AnimatedHeading className="t-h2" lines={["Soluções para diferentes", "etapas do seu negócio"]} />
          </SectionReveal>
          <div className="mt-14">
            <SolutionShowcase />
          </div>
        </Container>
      </section>

      {/* 5 — NORYOS OS */}
      <section id="noryos-os" className="section-impact surface-1 border-y border-[var(--hairline)] scroll-mt-24">
        <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
          <SectionReveal>
            <SectionLabel>A metodologia por trás</SectionLabel>
            <AnimatedHeading className="t-h2" lines={["Seu projeto não fica solto.", "Ele nasce organizado."]} />
            <p className="mt-5 max-w-md t-lead">
              O Noryos OS é a forma como cada projeto é estruturado — uma base pensada pra durar, com continuidade
              entre presença digital, aquisição, conteúdo, automações, dados e documentação.
            </p>
            <p className="mt-4 max-w-md text-sm text-[var(--color-text-muted)]">
              Navegue pelas categorias ao lado pra ver o que cada uma organiza.
            </p>
          </SectionReveal>
          <SectionReveal anim="fade-left" delay={80}>
            <Parallax strength={18}>
              <NoryosOSExplorer />
            </Parallax>
          </SectionReveal>
        </Container>
      </section>

      {/* 6 — DIAGNÓSTICO DIGITAL */}
      <section id="diagnostico" className="section scroll-mt-24">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <SectionReveal>
            <SectionLabel>Diagnóstico Digital Noryos</SectionLabel>
            <AnimatedHeading className="t-h2" lines={["Descubra onde sua operação", "digital pode melhorar."]} />
            <p className="mt-5 max-w-md t-lead">
              Uma avaliação inicial sobre site, mobile, presença no Google, conversão, WhatsApp, aquisição e
              automação — pra entender com clareza onde faz sentido investir primeiro.
            </p>
            <p className="mt-4 max-w-md text-sm text-[var(--color-text-muted)]">
              O retorno é analisado por uma pessoa, não gerado automaticamente. O painel ao lado é só uma
              demonstração do formato.
            </p>
          </SectionReveal>
          <SectionReveal anim="fade-left" delay={80}>
            <Parallax strength={16}>
              <DiagnosticPreview />
            </Parallax>
          </SectionReveal>
        </Container>
      </section>

      {/* 7 — COMO TRABALHAMOS */}
      <section id="processo" className="section surface-1 border-y border-[var(--hairline)] scroll-mt-24">
        <Container>
          <SectionReveal className="max-w-xl">
            <SectionLabel>Como trabalhamos</SectionLabel>
            <AnimatedHeading className="t-h2" lines={["Um processo claro, do", "início ao acompanhamento."]} />
          </SectionReveal>
          <div className="mt-6">
            <ProcessTimeline />
          </div>
        </Container>
      </section>

      {/* 8 — CENÁRIOS DEMONSTRATIVOS */}
      <section className="section">
        <Container>
          <SectionReveal className="max-w-xl">
            <SectionLabel>Cenários demonstrativos</SectionLabel>
            <AnimatedHeading className="t-h2" lines={["Como as soluções podem", "funcionar na prática"]} />
            <p className="mt-4 max-w-xl text-sm text-[var(--color-text-muted)]">
              A Noryos ainda não tem cases reais publicados. Os fluxos abaixo são exemplos de aplicação pra ilustrar
              o método — não resultados obtidos.
            </p>
          </SectionReveal>
          <div className="mt-10">
            <ApplicationScenarios />
          </div>
        </Container>
      </section>

      {/* 9 — POR QUE NORYOS */}
      <section className="section surface-1 border-y border-[var(--hairline)]">
        <Container>
          <SectionReveal className="max-w-xl">
            <SectionLabel>Por que Noryos</SectionLabel>
            <AnimatedHeading className="t-h2" lines={["Argumentos concretos,", "não adjetivos soltos."]} />
          </SectionReveal>
          <Stagger className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-2 lg:grid-cols-3">
            {porQueNoryos.map((item, i) => (
              <div
                key={item.titulo}
                data-anim="fade-up"
                style={staggerIndex(i)}
                className="flex flex-col gap-3 bg-[var(--color-surface-1)] p-7"
              >
                <span className="t-mono text-sm text-[var(--color-cyan)]">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="t-h3 text-[1.05rem]">{item.titulo}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{item.descricao}</p>
              </div>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* 10 — CREDIBILIDADE */}
      <section className="section">
        <Container>
          <SectionReveal className="max-w-3xl">
            <SectionLabel>Credibilidade</SectionLabel>
            <h2 className="t-h2">
              A Noryos é nova — e isso é dito com transparência, sem inventar case pra parecer maior do que é.
            </h2>
            <p className="mt-5 t-lead">
              O que sustenta a credibilidade aqui é o que dá pra verificar agora: o processo, a metodologia do
              Noryos OS, a forma como cada projeto é documentado, e a honestidade sobre o que ainda está em
              construção.
            </p>
          </SectionReveal>
          <Stagger className="mt-10 flex flex-wrap gap-3">
            {["Metodologia", "Execução", "Interfaces", "Documentação", "Transparência"].map((t, i) => (
              <span
                key={t}
                data-anim="fade-up"
                style={staggerIndex(i)}
                className="flex items-center gap-2 rounded-full border border-[var(--hairline-strong)] bg-[var(--color-surface-2)] px-3.5 py-2 text-sm text-[var(--color-text-muted)]"
              >
                <Icon name="check" size={14} className="text-[var(--color-green)]" />
                {t}
              </span>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* 11 — FAQ */}
      <section className="section surface-1 border-t border-[var(--hairline)]">
        <Container className="max-w-3xl">
          <SectionReveal>
            <SectionLabel>Perguntas frequentes</SectionLabel>
            <AnimatedHeading className="t-h2" lines={["Antes de conversar,", "talvez isso já responda"]} />
          </SectionReveal>
          <SectionReveal className="mt-10" delay={60}>
            <FaqAccordion items={faq} />
          </SectionReveal>
        </Container>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faqJsonLd(faq))} />
      </section>

      {/* 12 — CTA FINAL */}
      <FinalCTA />
    </>
  );
}
