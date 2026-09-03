import { ButtonLink } from "@/components/ui/Button";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Stagger } from "@/components/ui/motion";
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
 *
 * Layout: grade 2×2 row-major na ordem de prioridade comercial
 * (Presença → Automação / Aquisição → Conteúdo). Linha 1 força `h-full` nos
 * dois cards e centra a ilustração (`flex-1 justify-center`) — as duas
 * frentes-âncora ficam da mesma altura, com problema + solução. Linha 2 é
 * enxuta, altura natural, CTA logo após o gráfico. O CTA usa `mt-auto` pra
 * ancorar no rodapé quando o card estica. Resultado: as colunas terminam
 * juntas, sem vão. No mobile empilha na mesma ordem.
 */

/** CTA único dos cards — mesmo verbo, mesma aparência, ancorado no rodapé. */
function SolutionLink({ href }: { href: string }) {
  return (
    <ButtonLink href={href} variant="ghost" className="mt-auto pt-6 !px-0 !py-0" withArrow>
      Conhecer solução
    </ButtonLink>
  );
}

export function SolutionShowcase() {
  const [presenca, automacao, aquisicao, conteudo] = servicos;

  return (
    <Stagger className="grid gap-4 lg:grid-cols-[1.35fr_1fr] lg:items-start">
      {/* Presença Digital — card grande (col 1, linha 1) */}
      <div data-anim="fade-up" style={staggerIndex(0)} className="lg:h-full">
        <SpotlightCard className="flex h-full flex-col overflow-hidden p-7 sm:p-9">
          <span className="t-label text-[var(--color-cyan)]">{presenca.tag}</span>
          <h3 className="t-h3 mt-3">{presenca.titulo}</h3>
          <p className="mt-3 max-w-md text-sm text-[var(--color-text-muted)]">{presenca.problema}</p>
          <p className="mt-3 max-w-md text-sm text-[var(--color-text)]">{presenca.solucao}</p>
          <div className="mt-8 flex flex-1 flex-col justify-center">
            <PresenceJourney />
          </div>
          {presenca.href && <SolutionLink href={presenca.href} />}
        </SpotlightCard>
      </div>

      {/* Automação (col 2, linha 1) */}
      <div data-anim="fade-up" style={staggerIndex(1)} className="lg:h-full">
        <SpotlightCard className="flex h-full flex-col p-7">
          <span className="t-label text-[var(--color-green)]">{automacao.tag}</span>
          <h3 className="t-h3 mt-2 text-[1.15rem]">{automacao.titulo}</h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{automacao.problema}</p>
          <p className="mt-2 text-sm text-[var(--color-text)]">{automacao.beneficio}</p>
          <div className="mt-6 flex flex-1 flex-col justify-center">
            <AutomationConveyor />
          </div>
          {automacao.href && <SolutionLink href={automacao.href} />}
        </SpotlightCard>
      </div>

      {/* Aquisição e Performance (col 1, linha 2) */}
      <div data-anim="fade-up" style={staggerIndex(2)}>
        <SpotlightCard className="flex flex-col p-7">
          <span className="t-label text-[var(--color-green)]">{aquisicao.tag}</span>
          <h3 className="t-h3 mt-2 text-[1.15rem]">{aquisicao.titulo}</h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{aquisicao.beneficio}</p>
          <div className="mt-6">
            <PerformancePanel />
          </div>
          {aquisicao.href && <SolutionLink href={aquisicao.href} />}
        </SpotlightCard>
      </div>

      {/* Conteúdo e Presença (col 2, linha 2) */}
      <div data-anim="fade-up" style={staggerIndex(3)}>
        <SpotlightCard className="flex flex-col p-7">
          <span className="t-label text-[var(--color-green)]">{conteudo.tag}</span>
          <h3 className="t-h3 mt-2 text-[1.15rem]">{conteudo.titulo}</h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{conteudo.beneficio}</p>
          <div className="mt-6">
            <ChannelHub />
          </div>
          <SolutionLink href="/solucoes" />
        </SpotlightCard>
      </div>
    </Stagger>
  );
}
