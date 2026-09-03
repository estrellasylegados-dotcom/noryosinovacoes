import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsappCTA } from "@/components/WhatsappCTA";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { SectionReveal, Stagger } from "@/components/ui/motion";
import { Icon } from "@/components/ui/Icon";
import { FaqAccordion } from "@/components/FaqAccordion";
import { CommercialDoors } from "@/components/solucoes/CommercialDoors";
import { SegmentFlows } from "@/components/solucoes/SegmentFlows";
import { staggerIndex } from "@/lib/motion";
import { siteConfig, whatsappMessages, whatsappDisplay } from "@/lib/config";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  serviceJsonLd,
  jsonLdScript,
} from "@/lib/seo";
import {
  solucoesHero,
  problemasReconheciveis,
  problemasFecho,
  problemasCta,
  portasComerciais,
  complementosIntro,
  complementos,
  segmentosIntro,
  segmentosRotulo,
  inicioIntro,
  inicioTexto,
  inicioCta,
  cenariosInicio,
  primeiraConversa,
  primeiraConversaNota,
  primeiraConversaCta,
  compromissos,
  faqSolucoes,
  solucoesCtaFinal,
} from "@/content/solucoes";

export const metadata: Metadata = {
  title: "Soluções digitais para empresas: sites, tráfego pago e presença digital",
  description:
    "A Noryos cria e reestrutura sites, gerencia tráfego pago (Google Ads e Meta Ads) e organiza a presença digital de comércios locais e pequenas e médias empresas. Converse sobre a prioridade do seu negócio. Atendimento remoto em todo o Brasil.",
  alternates: { canonical: "/solucoes" },
};

export default function SolucoesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd([
            { nome: "Home", url: siteConfig.url },
            { nome: "Soluções", url: `${siteConfig.url}/solucoes` },
          ])
        )}
      />
      {portasComerciais.map((porta) => (
        <script
          key={porta.slug}
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(
            serviceJsonLd({
              nome: porta.titulo,
              descricao: porta.descricao,
              url: `${siteConfig.url}/solucoes`,
            })
          )}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqJsonLd(faqSolucoes))}
      />

      {/* 1 — HERO */}
      <section className="hero-bleed tech-grid glow-cyan relative overflow-hidden border-b border-[var(--hairline)] pb-16 pt-[calc(var(--header-h)+72px)]">
        <Container>
          <SectionLabel>{solucoesHero.eyebrow}</SectionLabel>
          <AnimatedHeading
            as="h1"
            className="t-display max-w-4xl text-[clamp(2.1rem,1.5rem+2.4vw,3.2rem)]"
            lines={[
              "Estrutura digital para a sua empresa",
              "ser encontrada, gerar contato",
              "e fechar mais negócio.",
            ]}
            accent="negócio"
          />
          <p className="mt-6 max-w-2xl t-lead">{solucoesHero.sub}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <WhatsappCTA message={whatsappMessages.geral}>
              {solucoesHero.ctaPrimario}
            </WhatsappCTA>
            <ButtonLink href="#solucoes" variant="secondary" withArrow>
              {solucoesHero.ctaSecundario}
            </ButtonLink>
          </div>
          <p className="mt-5 max-w-xl text-sm text-[var(--color-text-muted)]">
            {solucoesHero.microcopy}
          </p>
        </Container>
      </section>

      {/* 2 — TALVEZ VOCÊ ESTEJA PASSANDO POR ISSO */}
      <section className="section">
        <Container>
          <SectionReveal className="max-w-2xl">
            <SectionLabel>Talvez você esteja passando por isso</SectionLabel>
            <AnimatedHeading
              className="t-h2"
              lines={["Antes de falar de solução,", "vamos falar do que trava."]}
            />
          </SectionReveal>
          <Stagger className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {problemasReconheciveis.map((p, i) => (
              <div
                key={p}
                data-anim="fade-up"
                style={staggerIndex(i)}
                className="panel flex gap-3 p-5 text-sm text-[var(--color-text-muted)]"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-cyan)]/70" />
                {p}
              </div>
            ))}
          </Stagger>
          <SectionReveal className="mt-10 max-w-2xl" delay={60}>
            <p className="t-lead">{problemasFecho}</p>
            <div className="mt-6">
              <WhatsappCTA message={whatsappMessages.geral}>{problemasCta}</WhatsappCTA>
            </div>
          </SectionReveal>
        </Container>
      </section>

      {/* 3 — AS 3 SOLUÇÕES PRINCIPAIS */}
      <section id="solucoes" className="section-impact surface-1 border-y border-[var(--hairline)] scroll-mt-24">
        <Container>
          <SectionReveal className="max-w-2xl">
            <SectionLabel>Como podemos ajudar</SectionLabel>
            <AnimatedHeading
              className="t-h2"
              lines={["Três frentes para transformar", "presença em oportunidade."]}
            />
            <p className="mt-5 max-w-xl text-[var(--color-text-muted)]">
              A maioria dos projetos começa por uma delas. A reunião inicial serve para
              identificar qual faz mais diferença agora.
            </p>
          </SectionReveal>
          <div className="mt-12">
            <CommercialDoors />
          </div>
        </Container>
      </section>

      {/* 4 — SOLUÇÕES QUE PODEM COMPLETAR O PROJETO */}
      <section className="section">
        <Container>
          <SectionReveal className="max-w-2xl">
            <SectionLabel>Pode completar o projeto</SectionLabel>
            <AnimatedHeading
              className="t-h2"
              lines={["Recursos que entram quando", "resolvem uma necessidade real."]}
            />
            <p className="mt-5 max-w-xl text-[var(--color-text-muted)]">{complementosIntro}</p>
          </SectionReveal>
          <Stagger className="mt-10 grid gap-4 md:grid-cols-3">
            {complementos.map((c, i) => (
              <div
                key={c.titulo}
                data-anim="fade-up"
                style={staggerIndex(i)}
                className="panel flex flex-col p-6"
              >
                <span className="flex items-center gap-2.5 t-label text-[var(--color-text-dim)]">
                  <Icon name={c.icon} size={15} className="text-[var(--color-cyan)]" />
                  {c.titulo}
                </span>
                <p className="mt-3 flex-1 text-sm text-[var(--color-text-muted)]">{c.descricao}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {c.whatsapp && (
                    <WhatsappCTA message={whatsappMessages[c.whatsapp]} variant="ghost">
                      Falar sobre isso
                    </WhatsappCTA>
                  )}
                  {c.href && c.hrefLabel && (
                    <ButtonLink href={c.href} variant="ghost" withArrow>
                      {c.hrefLabel}
                    </ButtonLink>
                  )}
                </div>
              </div>
            ))}
          </Stagger>
          <SectionReveal className="mt-8" delay={60}>
            <p className="text-sm text-[var(--color-text-dim)]">
              Nem toda empresa precisa começar por tudo — e a página inicial não obriga a
              entender nem contratar tudo de uma vez.
            </p>
          </SectionReveal>
        </Container>
      </section>

      {/* 5 — POR SEGMENTO */}
      <section className="section surface-1 border-y border-[var(--hairline)]">
        <Container>
          <SectionReveal className="max-w-2xl">
            <SectionLabel>No contexto do seu negócio</SectionLabel>
            <h2 className="t-h2">{segmentosIntro}</h2>
            <p className="mt-4 max-w-xl text-sm text-[var(--color-text-muted)]">
              {segmentosRotulo}
            </p>
          </SectionReveal>
          <SectionReveal className="mt-10" delay={60}>
            <SegmentFlows />
          </SectionReveal>
        </Container>
      </section>

      {/* 6 — VOCÊ NÃO PRECISA CONTRATAR TUDO */}
      <section className="section">
        <Container>
          <SectionReveal className="max-w-2xl">
            <SectionLabel>Por onde começar</SectionLabel>
            <h2 className="t-h2">{inicioIntro}</h2>
            <p className="mt-5 max-w-xl text-[var(--color-text-muted)]">{inicioTexto}</p>
          </SectionReveal>
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cenariosInicio.map((c, i) => (
              <div
                key={c.rotulo}
                data-anim="fade-up"
                style={staggerIndex(i)}
                className="panel flex flex-col p-6"
              >
                <span className="font-mono text-2xl text-[var(--color-cyan)]">{c.rotulo}</span>
                <span className="mt-3 font-medium tracking-tight text-[var(--color-text)]">
                  {c.nome}
                </span>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{c.descricao}</p>
              </div>
            ))}
          </Stagger>
          <SectionReveal className="mt-8">
            <WhatsappCTA message={whatsappMessages.geral}>{inicioCta}</WhatsappCTA>
          </SectionReveal>
        </Container>
      </section>

      {/* 7 — COMO É A PRIMEIRA CONVERSA */}
      <section className="section surface-1 border-y border-[var(--hairline)]">
        <Container>
          <SectionReveal className="max-w-2xl">
            <SectionLabel>Como é a primeira conversa</SectionLabel>
            <AnimatedHeading
              className="t-h2"
              lines={["Uma conversa para entender —", "não para receber proposta na hora."]}
            />
          </SectionReveal>
          <Stagger className="mt-10 grid gap-4 md:grid-cols-5">
            {primeiraConversa.map((passo, i) => (
              <div
                key={passo}
                data-anim="fade-up"
                style={staggerIndex(i)}
                className="panel flex flex-col gap-3 p-5"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full border border-[var(--color-cyan)] font-mono text-xs text-[var(--color-cyan)]">
                  {i + 1}
                </span>
                <span className="text-sm text-[var(--color-text)]">{passo}</span>
              </div>
            ))}
          </Stagger>
          <SectionReveal className="mt-8" delay={60}>
            <p className="text-sm text-[var(--color-text-muted)]">{primeiraConversaNota}</p>
            <div className="mt-6">
              <WhatsappCTA message={whatsappMessages.geral}>{primeiraConversaCta}</WhatsappCTA>
            </div>
          </SectionReveal>
        </Container>
      </section>

      {/* 8 — O QUE ESPERAR DA NORYOS */}
      <section className="section">
        <Container>
          <SectionReveal className="max-w-2xl">
            <SectionLabel>O que esperar da Noryos</SectionLabel>
            <AnimatedHeading
              className="t-h2"
              lines={["Compromissos concretos,", "não adjetivos soltos."]}
            />
            <p className="mt-5 max-w-xl text-[var(--color-text-muted)]">
              A forma de trabalhar segue a metodologia do Noryos OS: cada projeto nasce
              organizado e com continuidade depois da entrega.
            </p>
          </SectionReveal>
          <Stagger className="mt-10 flex flex-wrap gap-3">
            {compromissos.map((c, i) => (
              <span
                key={c}
                data-anim="fade-up"
                style={staggerIndex(i)}
                className="flex items-center gap-2 rounded-full border border-[var(--hairline-strong)] bg-[var(--color-surface-2)] px-3.5 py-2 text-sm text-[var(--color-text-muted)]"
              >
                <Icon name="check" size={14} className="text-[var(--color-green)]" />
                {c}
              </span>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* 9 — FAQ COMERCIAL */}
      <section className="section surface-1 border-t border-[var(--hairline)]">
        <Container className="max-w-3xl">
          <SectionReveal>
            <SectionLabel>Perguntas frequentes</SectionLabel>
            <AnimatedHeading
              className="t-h2"
              lines={["Antes de conversar,", "talvez isso já responda"]}
            />
          </SectionReveal>
          <SectionReveal className="mt-10" delay={60}>
            <FaqAccordion items={faqSolucoes} />
          </SectionReveal>
        </Container>
      </section>

      {/* 10 — CTA FINAL */}
      <section className="tech-grid glow-cyan relative overflow-hidden border-t border-[var(--hairline)] section-impact">
        <Container className="relative max-w-2xl text-center">
          <SectionReveal>
            <SectionLabel>{solucoesCtaFinal.eyebrow}</SectionLabel>
            <h2 className="t-h2">{solucoesCtaFinal.heading}</h2>
          </SectionReveal>
          <SectionReveal delay={120}>
            <p className="t-lead mx-auto mt-5 max-w-xl">{solucoesCtaFinal.texto}</p>
          </SectionReveal>
          <SectionReveal delay={200}>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <WhatsappCTA message={whatsappMessages.geral}>
                {solucoesCtaFinal.ctaPrimario}
              </WhatsappCTA>
              <ButtonLink href="/diagnostico" variant="secondary" withArrow>
                {solucoesCtaFinal.ctaSecundario}
              </ButtonLink>
            </div>
            <p className="mt-8 font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-dim)]">
              Atendimento comercial: {whatsappDisplay}
            </p>
          </SectionReveal>
        </Container>
      </section>
    </>
  );
}
