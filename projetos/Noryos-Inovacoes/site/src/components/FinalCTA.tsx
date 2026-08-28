import { Container } from "@/components/ui/Container";
import { WhatsappCTA } from "@/components/WhatsappCTA";
import { ButtonLink } from "@/components/ui/Button";
import { SectionReveal } from "@/components/ui/motion";
import { SystemCanvas } from "@/components/system/SystemCanvas";

/**
 * §24 — cena de encerramento. Retoma o sistema visual do hero em baixa
 * intensidade: a página começa e termina no mesmo universo.
 */
export function FinalCTA() {
  return (
    <section className="tech-grid glow-cyan relative overflow-hidden border-t border-[var(--hairline)] section-impact">
      <div className="pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent_75%)]">
        <SystemCanvas faint />
      </div>
      <Container className="relative max-w-2xl text-center">
        <SectionReveal>
          <h2 className="t-h2">Sua operação digital pode funcionar melhor do que funciona hoje.</h2>
        </SectionReveal>
        <SectionReveal delay={120}>
          <p className="t-lead mx-auto mt-5 max-w-xl">
            Conte para nós o que está impedindo seu negócio de avançar. Primeiro entendemos o cenário. Depois
            avaliamos como podemos ajudar.
          </p>
        </SectionReveal>
        <SectionReveal delay={200}>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <WhatsappCTA>Conversar sobre meu projeto</WhatsappCTA>
            <ButtonLink href="/diagnostico" variant="secondary" withArrow>
              Solicitar meu diagnóstico
            </ButtonLink>
          </div>
        </SectionReveal>
      </Container>
    </section>
  );
}
