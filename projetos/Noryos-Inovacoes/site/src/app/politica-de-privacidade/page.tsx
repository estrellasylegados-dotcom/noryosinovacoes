import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como a Noryos Inovações trata os dados enviados pelo site.",
  alternates: { canonical: "/politica-de-privacidade" },
};

export default function PoliticaPrivacidadePage() {
  return (
    <section className="section">
      <Container className="max-w-2xl">
        <h1 className="t-h2">Política de Privacidade</h1>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">
          Última atualização: {new Date().toLocaleDateString("pt-BR", { year: "numeric", month: "long" })}
        </p>

        <div className="mt-10 grid gap-8 text-[var(--color-text-muted)]">
          <div>
            <h2 className="text-lg font-medium text-[var(--color-text)]">1. Quais dados coletamos</h2>
            <p className="mt-2">
              Coletamos apenas os dados que você preenche voluntariamente nos formulários do site — como no
              Diagnóstico Digital Noryos: nome da empresa, responsável, WhatsApp, e-mail e informações sobre a sua
              operação digital. Não exigimos cadastro nem coletamos dados além do necessário para responder à sua
              solicitação.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-[var(--color-text)]">2. Para que usamos</h2>
            <p className="mt-2">
              Os dados enviados são usados exclusivamente para a {siteConfig.name} entrar em contato, entender sua
              solicitação e, quando aplicável, elaborar um diagnóstico ou proposta comercial. Não vendemos nem
              compartilhamos seus dados com terceiros para fins de marketing.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-[var(--color-text)]">3. Base legal e consentimento</h2>
            <p className="mt-2">
              Ao enviar seus dados pelo formulário de diagnóstico ou contato, você concorda que a{" "}
              {siteConfig.name} entre em contato para tratar da sua solicitação, com base no seu consentimento
              (Art. 7º, I da LGPD) e no legítimo interesse em responder a uma solicitação comercial que você mesmo
              iniciou.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-[var(--color-text)]">4. Armazenamento e segurança</h2>
            <p className="mt-2">
              Os dados são armazenados em infraestrutura com controle de acesso restrito. Nenhum dado de formulário
              é exposto publicamente ou registrado em logs de acesso geral.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-[var(--color-text)]">5. Seus direitos</h2>
            <p className="mt-2">
              Você pode solicitar a qualquer momento a correção, exclusão ou informação sobre os dados que nos
              enviou, entrando em contato pelo e-mail{" "}
              <a href={`mailto:${siteConfig.email}`} className="underline hover:text-[var(--color-text)]">
                {siteConfig.email}
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-[var(--color-text)]">6. Cookies e analytics</h2>
            <p className="mt-2">
              O site pode utilizar ferramentas de análise de audiência (como Google Analytics) para entender o uso
              geral do site — sem identificar você pessoalmente. Nenhuma ferramenta de rastreamento publicitário é
              ativada sem aviso nesta política.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
