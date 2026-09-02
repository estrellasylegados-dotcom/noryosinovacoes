import { z } from "zod";

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Diagnóstico Digital — schema                                             │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Duas camadas, de propósito:
 *
 * 1. `diagnosticoSubmissionSchema` / `DiagnosticoSubmission` — **o que o
 *    formulário V2 envia**: contato + respostas ESTRUTURADAS (multiselect de
 *    chips, selects de cards) + notas livres opcionais. É o que o endpoint
 *    valida contra o corpo cru do POST.
 *
 * 2. `diagnosticoSchema` / `DiagnosticoInput` — **a forma LEGADA que o scoring
 *    V1 consome** (`src/lib/diagnostico-scoring.ts`). NÃO MUDOU: mesmos
 *    campos, mesmas regras. O endpoint deriva esta estrutura das respostas
 *    estruturadas via `composeLegacyText()` (`src/lib/diagnostico-compose.ts`)
 *    e só então pontua. `scoring_version` continua `"v1"`; o Form V2 melhora a
 *    ORIGEM do sinal, não os pesos.
 *
 * `consentimento` é obrigatório (LGPD, ver seção 12/36 do briefing).
 *
 * Todo campo de texto tem `.trim()` + limite de tamanho: o limite é a
 * primeira barreira de sanitização (payload não infla por um campo gigante) e
 * o servidor ainda passa tudo por `sanitizeText()` antes de persistir /
 * notificar. Todo campo estruturado é um `z.enum` de conjunto fechado —
 * valor fora da lista é rejeitado (400).
 */

const shortText = (max = 160) => z.string().trim().max(max);
const longText = (max = 2000) => z.string().trim().max(max);

/**
 * Campo de URL/link "leniente": aceita vazio, ou algo que ao menos pareça um
 * endereço — sem espaços e com um ponto (`exemplo.com.br`, `https://x.com/a`).
 * Não força `http://` pra não atrapalhar quem digita só o domínio.
 */
const looseUrl = (max = 300) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((v) => v === "" || (!/\s/.test(v) && /\.[a-z]{2,}/i.test(v)), "Informe um endereço válido");

// ───────────────────────────────────────────────────────────────────────────
// LEGADO — consumido pelo scoring V1. NÃO ALTERAR sem bump de SCORING_VERSION.
// ───────────────────────────────────────────────────────────────────────────

export const diagnosticoSchema = z.object({
  nomeEmpresa: z.string().trim().min(2, "Informe o nome da empresa").max(160),
  responsavel: z.string().trim().min(2, "Informe seu nome").max(160),
  whatsapp: z.string().trim().min(8, "Informe um WhatsApp válido").max(40),
  email: z.string().trim().email("E-mail inválido").max(180).optional().or(z.literal("")),
  cidade: shortText().optional().or(z.literal("")),
  segmento: shortText().optional().or(z.literal("")),
  site: looseUrl(300).optional().or(z.literal("")),
  instagram: shortText(300).optional().or(z.literal("")),
  googleBusiness: looseUrl(500).optional().or(z.literal("")),
  comoConquistaClientes: longText().optional().or(z.literal("")),
  dificuldade: longText().optional().or(z.literal("")),
  objetivo: longText().optional().or(z.literal("")),
  observacoes: longText().optional().or(z.literal("")),
  consentimento: z.literal(true, {
    message: "É necessário aceitar o contato da Noryos para enviar",
  }),
});

export type DiagnosticoInput = z.infer<typeof diagnosticoSchema>;

// ───────────────────────────────────────────────────────────────────────────
// V2 — respostas estruturadas (opções + rótulos legíveis)
// ───────────────────────────────────────────────────────────────────────────

/** Tamanho da operação (Etapa 1, opcional). NÃO pontua no scoring V1. */
export const PORTE_OPCOES = ["autonomo", "2_5", "6_20", "21_50", "51_mais", "nao_informar"] as const;
export type Porte = (typeof PORTE_OPCOES)[number];
export const PORTE_LABEL: Record<Porte, string> = {
  autonomo: "Profissional autônomo",
  "2_5": "2–5 pessoas",
  "6_20": "6–20 pessoas",
  "21_50": "21–50 pessoas",
  "51_mais": "51+ pessoas",
  nao_informar: "Prefiro não informar",
};

/** Ativos digitais que a empresa já tem (Etapa 2, multiselect). */
export const PRESENCA_OPCOES = [
  "site",
  "google_perfil",
  "instagram",
  "facebook",
  "tiktok",
  "loja_virtual",
  "landing_pages",
  "blog",
  "nenhum",
] as const;
export type PresencaOpcao = (typeof PRESENCA_OPCOES)[number];
export const PRESENCA_LABEL: Record<PresencaOpcao, string> = {
  site: "Site",
  google_perfil: "Perfil da Empresa no Google",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  loja_virtual: "Loja virtual / e-commerce",
  landing_pages: "Landing pages",
  blog: "Blog",
  nenhum: "Nenhum desses",
};
/** Opção exclusiva do bloco de presença (limpa as demais quando marcada). */
export const PRESENCA_EXCLUSIVA: PresencaOpcao = "nenhum";
/** Slugs de presença que abrem (e exigem) um campo de link/@ na Etapa 2. */
export const PRESENCA_COM_LINK = ["site", "instagram", "google_perfil"] as const;

/** Por onde a empresa consegue clientes hoje (Etapa 3, multiselect). */
export const CANAIS_OPCOES = [
  "indicacao",
  "instagram_redes",
  "google_organico",
  "google_ads",
  "meta_ads",
  "marketplace",
  "prospeccao_ativa",
  "email_marketing",
  "parcerias",
  "conteudo_seo",
  "outro",
] as const;
export type CanalOpcao = (typeof CANAIS_OPCOES)[number];
export const CANAIS_LABEL: Record<CanalOpcao, string> = {
  indicacao: "Indicação / boca a boca",
  instagram_redes: "Instagram / redes sociais",
  google_organico: "Google (busca orgânica)",
  google_ads: "Google Ads",
  meta_ads: "Meta Ads (Facebook/Instagram)",
  marketplace: "Marketplace (iFood, Mercado Livre, etc.)",
  prospeccao_ativa: "Prospecção ativa (você vai atrás)",
  email_marketing: "E-mail marketing",
  parcerias: "Parcerias",
  conteudo_seo: "Conteúdo / SEO",
  outro: "Outro",
};

/** Ferramentas de organização do atendimento (Etapa 4, multiselect). */
export const FERRAMENTAS_OPCOES = [
  "whatsapp_comum",
  "whatsapp_business",
  "crm",
  "sistema_proprio",
  "planilhas",
  "agenda_online",
  "chatbot",
  "nenhuma",
] as const;
export type FerramentaOpcao = (typeof FERRAMENTAS_OPCOES)[number];
export const FERRAMENTAS_LABEL: Record<FerramentaOpcao, string> = {
  whatsapp_comum: "WhatsApp comum",
  whatsapp_business: "WhatsApp Business",
  crm: "CRM",
  sistema_proprio: "Sistema próprio / ERP",
  planilhas: "Planilhas",
  agenda_online: "Agenda online",
  chatbot: "Chatbot / atendimento automático",
  nenhuma: "Nenhuma ferramenta específica",
};
export const FERRAMENTAS_EXCLUSIVA: FerramentaOpcao = "nenhuma";

/** Como o lead sente a organização do atendimento hoje (Etapa 4, select). */
export const ORGANIZACAO_OPCOES = [
  "organizado",
  "manual",
  "dificuldade_acompanhar",
  "perco_oportunidades",
  "estruturando",
] as const;
export type OrganizacaoOpcao = (typeof ORGANIZACAO_OPCOES)[number];
export const ORGANIZACAO_LABEL: Record<OrganizacaoOpcao, string> = {
  organizado: "Bem organizado e estruturado",
  manual: "Funciona, mas ainda é bem manual",
  dificuldade_acompanhar: "Tenho dificuldade de acompanhar os contatos",
  perco_oportunidades: "Perco oportunidades / demoro pra responder",
  estruturando: "Ainda estou estruturando isso",
};

/** Principal dificuldade hoje (Etapa 4, select). */
export const DIFICULDADE_OPCOES = [
  "poucos_clientes",
  "dependencia_indicacao",
  "site_fraco",
  "anuncios_sem_resultado",
  "atendimento_desorganizado",
  "falta_automacao",
  "redes_sem_estrategia",
  "falta_tempo_equipe",
  "nao_sei_comecar",
  "outro",
] as const;
export type DificuldadeOpcao = (typeof DIFICULDADE_OPCOES)[number];
export const DIFICULDADE_LABEL: Record<DificuldadeOpcao, string> = {
  poucos_clientes: "Poucos clientes / leads",
  dependencia_indicacao: "Dependo demais de indicação",
  site_fraco: "Site inexistente ou fraco",
  anuncios_sem_resultado: "Anúncios sem resultado",
  atendimento_desorganizado: "Atendimento desorganizado",
  falta_automacao: "Falta de automação",
  redes_sem_estrategia: "Redes sociais sem estratégia",
  falta_tempo_equipe: "Falta de tempo / equipe",
  nao_sei_comecar: "Não sei por onde começar",
  outro: "Outro",
};

/** Objetivo principal agora (Etapa 5, select — OBRIGATÓRIO). */
export const OBJETIVO_OPCOES = [
  "mais_clientes",
  "aumentar_vendas",
  "presenca_credibilidade",
  "criar_refazer_site",
  "melhorar_anuncios",
  "automatizar_atendimento",
  "melhorar_redes_conteudo",
  "organizar_operacao",
  "entendendo",
  "outro",
] as const;
export type ObjetivoOpcao = (typeof OBJETIVO_OPCOES)[number];
export const OBJETIVO_LABEL: Record<ObjetivoOpcao, string> = {
  mais_clientes: "Conseguir mais clientes",
  aumentar_vendas: "Aumentar vendas / faturamento",
  presenca_credibilidade: "Melhorar presença e credibilidade digital",
  criar_refazer_site: "Criar ou refazer o site",
  melhorar_anuncios: "Melhorar anúncios e aquisição",
  automatizar_atendimento: "Automatizar atendimento / processos",
  melhorar_redes_conteudo: "Melhorar redes sociais / conteúdo",
  organizar_operacao: "Organizar a operação digital",
  entendendo: "Ainda estou entendendo o que preciso",
  outro: "Outro",
};

/** Quando quer começar (Etapa 5, select — OBRIGATÓRIO). Alimenta a urgência
 *  do scoring V1 via `composeLegacyText` (decisão U1). */
export const PRAZO_OPCOES = ["o_quanto_antes", "ate_30_dias", "ate_90_dias", "3_a_6_meses", "pesquisando"] as const;
export type PrazoOpcao = (typeof PRAZO_OPCOES)[number];
export const PRAZO_LABEL: Record<PrazoOpcao, string> = {
  o_quanto_antes: "O quanto antes",
  ate_30_dias: "Nos próximos 30 dias",
  ate_90_dias: "Nos próximos 90 dias",
  "3_a_6_meses": "Em 3–6 meses",
  pesquisando: "Só pesquisando / entendendo possibilidades",
};

// ───────────────────────────────────────────────────────────────────────────
// V2 — schema de submissão
// ───────────────────────────────────────────────────────────────────────────

export const diagnosticoSubmissionSchema = z.object({
  // Etapa 1 — contato
  nomeEmpresa: z.string().trim().min(2, "Informe o nome da empresa").max(160),
  responsavel: z.string().trim().min(2, "Informe seu nome").max(160),
  whatsapp: z.string().trim().min(8, "Informe um WhatsApp válido").max(40),
  email: z.string().trim().email("E-mail inválido").max(180).optional().or(z.literal("")),
  cidade: shortText().optional().or(z.literal("")),
  segmento: shortText().optional().or(z.literal("")),
  porte: z.enum(PORTE_OPCOES).optional().or(z.literal("")),

  // Etapa 2 — presença digital
  presenca: z.array(z.enum(PRESENCA_OPCOES)).max(PRESENCA_OPCOES.length + 2).default([]),
  site: looseUrl(300).optional().or(z.literal("")),
  instagram: shortText(300).optional().or(z.literal("")),
  googleBusiness: looseUrl(500).optional().or(z.literal("")),

  // Etapa 3 — aquisição
  canais: z.array(z.enum(CANAIS_OPCOES)).max(CANAIS_OPCOES.length + 2).default([]),
  canaisOutro: shortText(160).optional().or(z.literal("")),
  aquisicaoNota: longText(600).optional().or(z.literal("")),

  // Etapa 4 — atendimento e organização
  ferramentas: z.array(z.enum(FERRAMENTAS_OPCOES)).max(FERRAMENTAS_OPCOES.length + 2).default([]),
  organizacao: z.enum(ORGANIZACAO_OPCOES).optional().or(z.literal("")),
  dificuldadePrincipal: z.enum(DIFICULDADE_OPCOES).optional().or(z.literal("")),
  dificuldadeOutro: shortText(160).optional().or(z.literal("")),
  dificuldadeNota: longText(600).optional().or(z.literal("")),

  // Etapa 5 — objetivo e prazo (OBRIGATÓRIOS, com opção de escape)
  objetivoPrincipal: z.enum(OBJETIVO_OPCOES),
  objetivoOutro: shortText(160).optional().or(z.literal("")),
  objetivoNota: longText(1000).optional().or(z.literal("")),
  prazo: z.enum(PRAZO_OPCOES),

  consentimento: z.literal(true, {
    message: "É necessário aceitar o contato da Noryos para enviar",
  }),
});

export type DiagnosticoSubmission = z.infer<typeof diagnosticoSubmissionSchema>;

/**
 * Regra de campo cruzado (checada no endpoint, não no schema, pra manter o
 * schema plano): se o lead marca que TEM Site / Instagram / Perfil no Google,
 * o link/@ correspondente passa a ser obrigatório. Isso preserva a regra de
 * presença do scoring V1 (presença = URL não-vazia) e entrega o ativo real
 * pra análise comercial antes do contato.
 */
export function linksObrigatoriosFaltando(sub: {
  presenca: readonly string[];
  site?: string | null;
  instagram?: string | null;
  googleBusiness?: string | null;
}): Array<"site" | "instagram" | "googleBusiness"> {
  const faltando: Array<"site" | "instagram" | "googleBusiness"> = [];
  const tem = (slug: string) => sub.presenca.includes(slug);
  if (tem("site") && !String(sub.site ?? "").trim()) faltando.push("site");
  if (tem("instagram") && !String(sub.instagram ?? "").trim()) faltando.push("instagram");
  if (tem("google_perfil") && !String(sub.googleBusiness ?? "").trim()) faltando.push("googleBusiness");
  return faltando;
}

// ───────────────────────────────────────────────────────────────────────────
// Etapas do formulário (V2 — 5 etapas)
// ───────────────────────────────────────────────────────────────────────────

export const diagnosticoSteps = [
  { titulo: "Sobre a empresa", obrigatorios: ["nomeEmpresa", "responsavel", "whatsapp"] as const },
  { titulo: "Presença digital", obrigatorios: [] as const },
  { titulo: "Como você consegue clientes", obrigatorios: [] as const },
  { titulo: "Atendimento e organização", obrigatorios: [] as const },
  { titulo: "Objetivo e prazo", obrigatorios: ["objetivoPrincipal", "prazo", "consentimento"] as const },
] as const;
