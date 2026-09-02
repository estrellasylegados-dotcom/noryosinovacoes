/**
 * Ponte Form V2 → scoring V1.
 *
 * O formulário V2 coleta respostas ESTRUTURADAS (chips/cards). O scoring V1
 * (`src/lib/diagnostico-scoring.ts`) continua sendo uma função pura sobre a
 * forma LEGADA (`DiagnosticoInput`: `comoConquistaClientes` / `dificuldade` /
 * `objetivo` / `observacoes` em texto livre + presença por URL).
 *
 * `composeLegacyText()` monta esse texto legado a partir das respostas
 * estruturadas, usando **o vocabulário que os léxicos do scoring V1 já
 * casam** (`src/lib/diagnostico-scoring.ts` → `KW`). Resultado:
 *
 *   - `scoring-scoring.ts` NÃO muda: mesmos pesos, mesmas faixas, `v1`.
 *   - Uma submissão V2 cai na mesma faixa que o equivalente digitado à mão
 *     cairia hoje.
 *   - O Form V2 melhora a ORIGEM do sinal (resposta estruturada no lugar de
 *     inferência por keyword), não o algoritmo.
 *
 * DECISÃO U1 (aprovada): `prazo` alimenta a urgência do scoring V1 aqui,
 * anexando ao `objetivo` uma frase que o léxico `KW.urgencia` (ou
 * `KW.exploratorio`) já reconhece:
 *   o_quanto_antes / ate_30_dias   → urgência
 *   ate_90_dias / 3_a_6_meses      → sem urgência
 *   pesquisando                    → exploratório (trava o objetivo em 6)
 *
 * Função PURA: sem rede, sem I/O, sem estado. Testes em
 * `e2e/diagnostico-compose.spec.ts`.
 */

import {
  type DiagnosticoInput,
  type DiagnosticoSubmission,
  ORGANIZACAO_LABEL,
  PORTE_LABEL,
} from "@/app/diagnostico/schema";

const MAX = 1900; // folga confortável abaixo do `.max(2000)` do schema legado

const trim = (v: string | null | undefined) => (v ?? "").trim();
const join = (partes: string[]) => partes.map(trim).filter(Boolean).join(" ").slice(0, MAX);

// ───────────────────────────────────────────────────────────────────────────
// Frases por opção — calibradas pros léxicos do scoring V1 (NÃO são rótulos
// de UI; os rótulos legíveis ficam em `schema.ts` → *_LABEL).
// ───────────────────────────────────────────────────────────────────────────

/** canais → frase pro campo `comoConquistaClientes`. `outro` vem de texto. */
const CANAL_FRASE: Record<string, string> = {
  indicacao: "indicação e boca a boca",
  instagram_redes: "Instagram e redes sociais",
  google_organico: "busca orgânica no Google",
  google_ads: "Google Ads",
  meta_ads: "Meta Ads (Facebook Ads e Instagram Ads)",
  marketplace: "marketplaces (iFood, Mercado Livre e similares)",
  prospeccao_ativa: "prospecção ativa e outbound",
  email_marketing: "e-mail marketing",
  parcerias: "parcerias",
  conteudo_seo: "conteúdo e SEO",
};

/** dificuldade principal → frase pro campo `dificuldade`. */
const DIFICULDADE_FRASE: Record<string, string> = {
  poucos_clientes: "A maior dificuldade hoje é conseguir clientes e leads em quantidade suficiente.",
  dependencia_indicacao: "A maior dificuldade é depender demais de indicação para conseguir cliente.",
  site_fraco: "A maior dificuldade é o site fraco, que não converte bem.",
  anuncios_sem_resultado: "A maior dificuldade é que os anúncios não trazem resultado.",
  atendimento_desorganizado: "A maior dificuldade é o atendimento desorganizado.",
  falta_automacao:
    "A maior dificuldade é a falta de automação: não temos automação e o processo é manual e repetitivo.",
  redes_sem_estrategia: "A maior dificuldade é que as redes sociais não têm estratégia.",
  falta_tempo_equipe: "A maior dificuldade é a falta de tempo e de equipe para dar conta de tudo.",
  nao_sei_comecar: "A maior dificuldade é não saber por onde começar.",
};

/**
 * Organização do atendimento → frase pro campo `dificuldade`, MAS só os
 * estados negativos (que legitimamente são "dificuldade"). `organizado` e
 * `estruturando` não entram como dificuldade — se entrassem, um lead
 * organizado com dor de aquisição real teria o critério "dor" zerado à toa
 * (o scoring V1 trata "campo dificuldade preenchido e sem frase de
 * tranquilidade" como "tem dor"). Ver `diagnostico-scoring.ts`.
 */
const ORG_DIFICULDADE_FRASE: Record<string, string> = {
  manual: "O acompanhamento dos contatos ainda é bem manual.",
  dificuldade_acompanhar: "Me perco para acompanhar os contatos e dar seguimento.",
  perco_oportunidades: "Estou perdendo oportunidade porque demoro para responder os contatos.",
};

/** objetivo principal → frase pro campo `objetivo`. `outro` vem de texto. */
const OBJETIVO_FRASE: Record<string, string> = {
  mais_clientes: "O objetivo principal agora é conseguir mais clientes.",
  aumentar_vendas: "O objetivo principal agora é aumentar as vendas e o faturamento.",
  presenca_credibilidade: "O objetivo principal agora é melhorar a presença e a credibilidade digital.",
  criar_refazer_site: "O objetivo principal agora é criar ou refazer o site.",
  melhorar_anuncios: "O objetivo principal agora é melhorar os anúncios e a aquisição de clientes.",
  automatizar_atendimento: "O objetivo principal agora é automatizar o atendimento e os processos.",
  melhorar_redes_conteudo: "O objetivo principal agora é melhorar as redes sociais e o conteúdo.",
  organizar_operacao: "O objetivo principal agora é organizar a operação digital.",
  entendendo: "Ainda estou entendendo melhor o que preciso e quero avaliar as possibilidades.",
};

/** prazo → frase pro campo `objetivo` (decisão U1). */
const PRAZO_FRASE: Record<string, string> = {
  o_quanto_antes: "Quero resolver isso o quanto antes.",
  ate_30_dias: "Quero começar ainda este mês.",
  ate_90_dias: "Pretendo começar nos próximos 90 dias.",
  "3_a_6_meses": "Penso em começar daqui a três a seis meses.",
  pesquisando: "Por enquanto estou só pesquisando, sem pressa, quero entender melhor as possibilidades.",
};

/** ferramentas → frase pro campo `observacoes` (contexto; ferramentas reais
 *  como CRM/ERP/chatbot/agenda online sobem a maturidade de atendimento via o
 *  léxico `KW.atendimentoEstrutura`, checado sobre o texto agregado). */
const FERRAMENTA_FRASE: Record<string, string> = {
  whatsapp_comum: "WhatsApp comum",
  whatsapp_business: "WhatsApp Business",
  crm: "CRM",
  sistema_proprio: "sistema próprio (ERP)",
  planilhas: "planilhas",
  agenda_online: "agenda online",
  chatbot: "chatbot de atendimento",
};

// ───────────────────────────────────────────────────────────────────────────

function comoConquistaClientes(sub: DiagnosticoSubmission): string {
  const canais = sub.canais.filter((c) => c !== "outro");
  const partes = canais.map((c) => CANAL_FRASE[c]).filter(Boolean);
  if (sub.canais.includes("outro") && trim(sub.canaisOutro)) partes.push(trim(sub.canaisOutro));

  const frase = partes.length ? `Hoje consegue clientes por: ${partes.join(", ")}.` : "";
  return join([frase, trim(sub.aquisicaoNota)]);
}

function dificuldade(sub: DiagnosticoSubmission): string {
  const linhas: string[] = [];

  if (sub.dificuldadePrincipal === "outro") {
    if (trim(sub.dificuldadeOutro)) linhas.push(`A maior dificuldade hoje: ${trim(sub.dificuldadeOutro)}.`);
  } else if (sub.dificuldadePrincipal && DIFICULDADE_FRASE[sub.dificuldadePrincipal]) {
    linhas.push(DIFICULDADE_FRASE[sub.dificuldadePrincipal]);
  }

  if (sub.organizacao && ORG_DIFICULDADE_FRASE[sub.organizacao]) {
    linhas.push(ORG_DIFICULDADE_FRASE[sub.organizacao]);
  }

  if (trim(sub.dificuldadeNota)) linhas.push(trim(sub.dificuldadeNota));

  return join(linhas);
}

function objetivo(sub: DiagnosticoSubmission): string {
  const linhas: string[] = [];

  if (sub.objetivoPrincipal === "outro") {
    linhas.push(
      trim(sub.objetivoOutro)
        ? `O objetivo principal agora é: ${trim(sub.objetivoOutro)}.`
        : "O objetivo principal ainda não está totalmente definido."
    );
  } else {
    linhas.push(OBJETIVO_FRASE[sub.objetivoPrincipal] ?? "");
  }

  // U1 — prazo alimenta a urgência (ou o caráter exploratório) do scoring V1.
  linhas.push(PRAZO_FRASE[sub.prazo] ?? "");

  if (trim(sub.objetivoNota)) linhas.push(trim(sub.objetivoNota));

  return join(linhas);
}

function observacoes(sub: DiagnosticoSubmission): string {
  const linhas: string[] = [];

  if (sub.ferramentas.includes("nenhuma")) {
    linhas.push("Nada é automatizado no atendimento hoje e não usa nenhuma ferramenta específica.");
  } else {
    const nomes = sub.ferramentas.map((f) => FERRAMENTA_FRASE[f]).filter(Boolean);
    if (nomes.length) linhas.push(`Ferramentas de atendimento hoje: ${nomes.join(", ")}.`);
  }

  if (sub.organizacao) {
    linhas.push(`Percepção sobre a organização do atendimento: ${ORGANIZACAO_LABEL[sub.organizacao].toLowerCase()}.`);
  }

  if (sub.porte && sub.porte !== "nao_informar") {
    linhas.push(`Porte da operação: ${PORTE_LABEL[sub.porte].toLowerCase()}.`);
  }

  return join(linhas);
}

export type LegacyText = Pick<
  DiagnosticoInput,
  "comoConquistaClientes" | "dificuldade" | "objetivo" | "observacoes"
>;

/** Deriva os 4 campos de texto legados que o scoring V1 consome. Puro. */
export function composeLegacyText(sub: DiagnosticoSubmission): LegacyText {
  return {
    comoConquistaClientes: comoConquistaClientes(sub),
    dificuldade: dificuldade(sub),
    objetivo: objetivo(sub),
    observacoes: observacoes(sub),
  };
}

/**
 * Monta o `DiagnosticoInput` completo (forma legada) a partir da submissão
 * V2: contato + links (presença = URL não-vazia, regra V1 intacta) + texto
 * legado composto. É o objeto que vai pro `scoreDiagnostico()` e pras colunas
 * legadas do Supabase.
 */
export function submissionToDiagnosticoInput(sub: DiagnosticoSubmission): DiagnosticoInput {
  return {
    nomeEmpresa: sub.nomeEmpresa,
    responsavel: sub.responsavel,
    whatsapp: sub.whatsapp,
    email: trim(sub.email),
    cidade: trim(sub.cidade),
    segmento: trim(sub.segmento),
    site: trim(sub.site),
    instagram: trim(sub.instagram),
    googleBusiness: trim(sub.googleBusiness),
    ...composeLegacyText(sub),
    consentimento: true,
  };
}
