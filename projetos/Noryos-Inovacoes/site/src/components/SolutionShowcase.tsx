import { ButtonLink } from "@/components/ui/Button";
import { WhatsappCTA } from "@/components/WhatsappCTA";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { SectionReveal, Stagger } from "@/components/ui/motion";
import { staggerIndex } from "@/lib/motion";
import { PresenceJourney } from "@/components/system/PresenceJourney";
import { AutomationConveyor } from "@/components/system/AutomationConveyor";
import { PerformancePanel } from "@/components/system/PerformancePanel";
import { ChannelHub } from "@/components/system/ChannelHub";
import { servicos } from "@/content/servicos";

/**
 * §14 — soluções como composição editorial assimétrica, cada card
 * demonstrando visualmente a natureza da solução. Sem quatro retângulos
 * idênticos. Dados vêm de content/servicos.ts (ordem = prioridade
 * comercial, não mexer).
 */
export function SolutionShowcase() {
  const [presenca, automacao, aquisicao, conteudo] = servicos;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr] lg:items-start">
      {/* Card grande — Presença Digital */}
      <SectionReveal anim="fade-up">
        <SpotlightCard className="flex flex-col overflow-hidden p-7 sm:p-9">
          <span className="t-label text-[var(--color-cyan)]">{presenca.tag}</span>
          <h3 className="t-h3 mt-3">{presenca.titulo}</h3>
          <p className="mt-3 max-w-md text-sm text-[var(--color-text-muted)]">{presenca.problema}</p>
          <p className="mt-3 max-w-md text-sm text-[var(--color-text)]">{presenca.solucao}</p>
          <div className="mt-8">
            <PresenceJourney />
          </div>
          <div className="mt-10">
            {presenca.href && (
              <ButtonLink href={presenca.href} variant="secondary" withArrow>
                Ver Presença Digital
              </ButtonLink>
            )}
          </div>
        </SpotlightCard>
      </SectionReveal>

      {/* Coluna direita — três cards variados */}
      <Stagger className="grid gap-4">
        {/* Automação — esteira operacional viva */}
        <div data-anim="fade-up" style={staggerIndex(0)}>
          <SpotlightCard className="p-7">
            <span className="t-label text-[var(--color-green)]">{automacao.tag}</span>
            <h4 className="t-h3 mt-2 text-[1.15rem]">{automacao.titulo}</h4>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{automacao.beneficio}</p>
            <div className="mt-6">
              <AutomationConveyor />
            </div>
            {automacao.href && (
              <ButtonLink href={automacao.href} variant="ghost" className="mt-4 !px-0 !py-0" withArrow>
                Ver solução
              </ButtonLink>
            )}
          </SpotlightCard>
        </div>

        {/* Aquisição — gráfico ilustrativo */}
        <div data-anim="fade-up" style={staggerIndex(1)}>
          <SpotlightCard className="p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="t-label text-[var(--color-green)]">{aquisicao.tag}</span>
                <h4 className="t-h3 mt-2 text-[1.15rem]">{aquisicao.titulo}</h4>
              </div>
            </div>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{aquisicao.beneficio}</p>
            <div className="mt-5">
              <PerformancePanel />
            </div>
            {aquisicao.href && (
              <ButtonLink href={aquisicao.href} variant="ghost" className="mt-4 !px-0 !py-0" withArrow>
                Ver solução
              </ButtonLink>
            )}
          </SpotlightCard>
        </div>

        {/* Conteúdo — sequência de criativos */}
        <div data-anim="fade-up" style={staggerIndex(2)}>
          <SpotlightCard className="p-7">
            <span className="t-label text-[var(--color-green)]">{conteudo.tag}</span>
            <h4 className="t-h3 mt-2 text-[1.15rem]">{conteudo.titulo}</h4>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{conteudo.beneficio}</p>
            <div className="mt-5">
              <ChannelHub />
            </div>
            <WhatsappCTA variant="ghost" className="mt-4 !px-0 !py-0">
              Perguntar sobre conteúdo
            </WhatsappCTA>
          </SpotlightCard>
        </div>
      </Stagger>
    </div>
  );
}
