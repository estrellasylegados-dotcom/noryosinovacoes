import { WhatsappCTA } from "@/components/WhatsappCTA";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Stagger } from "@/components/ui/motion";
import { staggerIndex } from "@/lib/motion";
import { whatsappMessages } from "@/lib/config";
import { portasComerciais } from "@/content/solucoes";

/**
 * As 3 portas comerciais principais (Sites / Tráfego / Presença). Cada
 * card é uma "porta grande": proposta de valor + mini-fluxo estático +
 * lista de quando resolve + CTA primário WhatsApp contextual e link
 * secundário para a página de aprofundamento quando existir.
 *
 * Sem animação pesada — só o reveal de entrada do <Stagger> (reduced-motion
 * tratado no globals.css).
 */

/** Mini-fluxo de 3 passos, estático. Legível a partir de ~320px. */
function MiniFlow({ steps }: { steps: readonly string[] }) {
  return (
    <div className="mt-6 flex items-stretch gap-1.5 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--color-surface-1)] p-3">
      {steps.map((s, i) => (
        <div key={s} className="flex flex-1 items-center gap-1.5">
          <span className="flex-1 text-center font-mono text-[10px] uppercase leading-tight tracking-[0.08em] text-[var(--color-text-muted)]">
            {s}
          </span>
          {i < steps.length - 1 && (
            <Icon name="arrow" size={13} className="shrink-0 text-[var(--color-cyan)]/60" />
          )}
        </div>
      ))}
    </div>
  );
}

export function CommercialDoors() {
  return (
    <Stagger className="grid gap-5">
      {portasComerciais.map((porta, i) => (
        <div key={porta.slug} data-anim="fade-up" style={staggerIndex(i)}>
          <SpotlightCard className="grid gap-7 p-7 sm:p-9 lg:grid-cols-[1.3fr_1fr] lg:gap-10">
            <div className="flex flex-col">
              <span className="flex items-center gap-2.5 t-label text-[var(--color-cyan)]">
                <Icon name={porta.icon} size={15} />
                {porta.tag}
              </span>
              <h3 className="t-h3 mt-3">{porta.titulo}</h3>
              <p className="mt-2 font-medium text-[var(--color-text)]">{porta.ancora}</p>
              <p className="mt-3 text-sm text-[var(--color-text-muted)]">{porta.descricao}</p>

              <MiniFlow steps={porta.mini} />

              <div className="mt-auto flex flex-wrap gap-3 pt-6">
                <WhatsappCTA message={whatsappMessages[porta.whatsapp]}>
                  {porta.ctaLabel}
                </WhatsappCTA>
                {porta.href && porta.hrefLabel && (
                  <ButtonLink href={porta.href} variant="secondary" withArrow>
                    {porta.hrefLabel}
                  </ButtonLink>
                )}
              </div>
            </div>

            <div className="lg:border-l lg:border-[var(--hairline)] lg:pl-10">
              <span className="t-label text-[var(--color-text-dim)]">Resolve quando</span>
              <ul className="mt-4 grid gap-2.5">
                {porta.problemas.map((p) => (
                  <li key={p} className="flex gap-2.5 text-sm text-[var(--color-text-muted)]">
                    <Icon
                      name="check"
                      size={15}
                      className="mt-0.5 shrink-0 text-[var(--color-green)]"
                    />
                    {p}
                  </li>
                ))}
              </ul>
              {porta.nota && (
                <p className="mt-5 border-t border-[var(--hairline)] pt-4 text-xs text-[var(--color-text-dim)]">
                  {porta.nota}
                </p>
              )}
            </div>
          </SpotlightCard>
        </div>
      ))}
    </Stagger>
  );
}
