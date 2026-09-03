/**
 * Configuração central da Noryos Inovações.
 *
 * Regra do projeto: nenhum componente deve ter número de WhatsApp, e-mail,
 * URL ou nome de marca "hardcoded" espalhado pelo código. Tudo referencia
 * este arquivo (que por sua vez lê de variáveis de ambiente quando existem).
 *
 * Pra trocar o WhatsApp, e-mail ou domínio: edite o .env (ou .env.local)
 * — não edite componentes. Veja README.md → "Como alterar WhatsApp".
 */

const rawWhatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

/** Número em formato E.164 sem símbolos, ex: 5511999999999. Vazio = ainda não definido. */
export const whatsappNumber = rawWhatsapp.replace(/\D/g, "");

/**
 * Exibição humana do número comercial — usar em texto visível (rodapé,
 * "atendimento comercial: …"). O link continua vindo de getWhatsappLink().
 */
export const whatsappDisplay = "(61) 99925-6901";

/**
 * Mensagens pré-preenchidas do WhatsApp por origem/intenção (§ página
 * /solucoes). Ponto único — nenhum componente monta texto de wa.me na mão.
 * Sem contexto claro numa origem, usar `geral`.
 */
export const whatsappMessages = {
  geral:
    "Olá! Conheci a Noryos pelo site e gostaria de conversar sobre minha empresa.",
  site:
    "Olá! Vi a solução de Sites da Noryos e gostaria de avaliar meu site/presença web.",
  trafego:
    "Olá! Vi a solução de Aquisição e Performance e gostaria de conversar sobre tráfego pago para minha empresa.",
  automacao:
    "Olá! Gostaria de conversar sobre automação e integrações para o atendimento da minha empresa.",
  presenca:
    "Olá! Gostaria de conversar sobre como organizar a presença digital da minha empresa.",
} as const;

export type WhatsappPreset = keyof typeof whatsappMessages;

/** Mensagem padrão pré-preenchida no link do WhatsApp (origem sem contexto). */
const defaultWhatsappMessage = whatsappMessages.geral;

/**
 * Gera o link de WhatsApp centralizado. Se o número ainda não estiver
 * configurado (fase atual), cai no mailto de contato como fallback —
 * nunca quebra o CTA, nunca expõe número de placeholder fake no HTML.
 */
export function getWhatsappLink(message: string = defaultWhatsappMessage): string {
  if (!whatsappNumber) {
    return `mailto:${siteConfig.email}?subject=${encodeURIComponent("Contato via site")}`;
  }
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const siteConfig = {
  name: "Noryos Inovações",
  shortName: "Noryos",
  domain: "noryosinovacoes.com.br",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://noryosinovacoes.com.br",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contato@noryosinovacoes.com.br",
  locale: "pt_BR",
  description:
    "A Noryos conecta presença digital, aquisição e automação para construir operações mais organizadas, eficientes e preparadas para crescer.",
  tagline: "Tecnologia que conecta estratégia, operação e crescimento.",
  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "",
  },
  atendimento: "Atendimento a empresas em todo o Brasil.",
} as const;

/** IDs de analytics — ficam vazios até serem configurados de verdade. Nunca hardcode um ID de teste. */
export const analyticsConfig = {
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID ?? "",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? "",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
} as const;

/** Nomes de evento usados em toda a aplicação — ver README → Analytics.
 *  Sem PII: os eventos do Diagnóstico carregam no máximo número de etapa,
 *  status HTTP e duração. Nunca nome/e-mail/telefone/empresa/texto livre. */
export const analyticsEvents = {
  clickWhatsapp: "clique_whatsapp",
  viewSolucao: "visualizar_solucao",
  contato: "contato",
  lead: "lead",
  // Funil do Diagnóstico Digital (Form V2)
  startDiagnostico: "iniciar_diagnostico",
  viewStepDiagnostico: "visualizar_etapa",
  nextStepDiagnostico: "avancar_etapa",
  prevStepDiagnostico: "voltar_etapa",
  stepErrorDiagnostico: "erro_validacao_etapa",
  turnstileDoneDiagnostico: "turnstile_concluido",
  submitDiagnostico: "enviar_diagnostico",
  successDiagnostico: "diagnostico_enviado_com_sucesso",
  errorDiagnostico: "diagnostico_envio_falhou",
} as const;
