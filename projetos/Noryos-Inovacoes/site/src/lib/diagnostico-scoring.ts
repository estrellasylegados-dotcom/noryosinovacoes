/**
 * Scoring V1 do Diagnóstico Digital — qualificação comercial automática.
 *
 * DETERMINÍSTICO, AUDITÁVEL, SEM IA. Regras explícitas, pesos como constantes
 * no topo do arquivo — recalibrar = mudar número + `bump` de SCORING_VERSION.
 *
 * `scoreDiagnostico()` é uma FUNÇÃO PURA: recebe os dados já validados (zod) e
 * devolve a estrutura completa. Sem I/O, sem rede, sem estado. Na pipeline do
 * endpoint ela roda DEPOIS de método/Content-Type/payload/JSON/honeypot/tempo
 * mínimo/rate limit/Turnstile/zod e DEPOIS do short-circuit de dedupe (uma
 * duplicata devolve o resultado em cache e não é repontuada).
 *
 * Dois scores independentes, escala 0–100:
 *  - maturidadeDigital  → quão estruturada a empresa já é digitalmente
 *                         (alto = mais estruturada). Vai pra coluna própria.
 *  - potencialComercial → quão aderente a oportunidade parece à Noryos
 *                         (alto = melhor oportunidade). Vira a coluna `score`.
 *
 * Léxicos (`KW`) são exportados pra os testes e pra recalibração. O texto do
 * lead é normalizado (sem acento, minúsculo) antes de qualquer match — os
 * padrões são todos escritos sem acento.
 */

import type { DiagnosticoInput } from "../app/diagnostico/schema";

export const SCORING_VERSION = "v1" as const;

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type Classificacao =
  | "baixa_prioridade"
  | "oportunidade_fria"
  | "boa_oportunidade"
  | "oportunidade_quente"
  | "prioridade_comercial";

export type Prioridade = "baixa" | "media" | "alta" | "critica";

export type ServicoNoryos =
  | "Presença Digital"
  | "Automações"
  | "Aquisição e Performance"
  | "Conteúdo"
  | "Redes Sociais";

export type GapCode =
  | "ausencia_site"
  | "site_possivelmente_defasado"
  | "baixa_organizacao_presenca_digital"
  | "presenca_google_ausente"
  | "redes_sociais_ausentes"
  | "aquisicao_nao_estruturada"
  | "dependencia_de_indicacao"
  | "atendimento_manual"
  | "ausencia_automacao";

export type Gap = {
  /** código estável — filtro/relatório */
  codigo: GapCode;
  /** rótulo legível — usado no e-mail interno */
  titulo: string;
  /** de qual campo / grupo de evidência o gap saiu (sem PII do lead) */
  base: string;
};

export type Criterio = {
  dimensao: "maturidade" | "potencial";
  /** slug estável do critério */
  criterio: string;
  pontos: number;
  max: number;
  /** campo + grupo detectado que justificou os pontos (sem texto cru do lead) */
  base: string;
};

/** Completude dos dados de contato — informativo, NÃO entra no score. */
export type QualidadeContato = {
  email: boolean;
  cidade: boolean;
  segmento: boolean;
};

export type DiagnosticoScoring = {
  scoringVersion: typeof SCORING_VERSION;
  maturidadeDigital: number;
  potencialComercial: number;
  classificacao: Classificacao;
  prioridade: Prioridade;
  gaps: Gap[];
  servicosRecomendados: ServicoNoryos[];
  proximaAcao: string;
  qualidadeContato: QualidadeContato;
  criterios: Criterio[];
};

// ---------------------------------------------------------------------------
// Pesos (calibráveis — mudar aqui e bumpar SCORING_VERSION)
// ---------------------------------------------------------------------------

const PESOS = {
  maturidade: {
    site: 35, // 30 presente + 5 se usado como canal
    googleBusiness: 20,
    instagram: 15,
    aquisicao: 20, // 20 paga | 12 organico estruturado | 7 redes s/ estrutura | 4 indicacao | 0 vazio
    atendimento: 10, // 10 estrutura | 7 organizado | 5 sem info | 3 manual | 1 severo
  },
  potencial: {
    gaps: 35, // sem site 14 + sem GBP 7 + sem redes 5 + aquisicao fraca 9
    dor: 20, // 14 preenchida + 6 dor relevante
    objetivo: 25, // 13 preenchido + 12 crescimento | exploratorio cap 6
    urgencia: 10,
    aderencia: 10, // 4 por categoria de servico Noryos evidenciada
  },
} as const;

// ---------------------------------------------------------------------------
// Léxicos — padrões SEM ACENTO, casados contra texto normalizado
// ---------------------------------------------------------------------------

export const KW = {
  /** mídia paga / campanha estruturada → aquisicao 20 */
  aquisicaoPaga: [
    /\bgoogle ads\b/,
    /\bmeta ads\b/,
    /\bfacebook ads\b/,
    /\binstagram ads\b/,
    /\btiktok ads\b/,
    /\bgoogle adwords\b/,
    /\badwords\b/,
    /\btrafego pago\b/,
    /\bmidia paga\b/,
    /\bgest(or|ao) de trafego\b/,
    /\banuncios? pagos?\b/,
    /\bimpulsionament/,
  ],
  /** desejo/negação de mídia paga — NÃO conta como estrutura */
  aquisicaoPagaNegada: [
    /(nunca|jamais|ainda nao|nao)\s+(fiz|fizemos|investi|investimos|rodei|rodamos|usei|usamos)/,
    /(pensei em|penso em|gostaria de|quero|pretendo|planejo)\s+([a-z]+\s+){0,3}(anunci|ads|trafego|campanha|impulsion)/,
  ],
  /** orgânico com estrutura comprovada → aquisicao 12 */
  aquisicaoOrganicaEstrut: [
    /\bseo\b/,
    /\bfunil\b/,
    /\blanding\b/,
    /\bpagina de captura\b/,
    /\bcrm\b/,
    /e-?mail marketing/,
    /\bnewsletter\b/,
    /automacao de marketing/,
    /nutricao de leads?/,
    /geracao (recorrente|mensuravel|estruturada)? ?de leads?/,
    /prospeccao ativa/,
    /\boutbound\b/,
    /\binbound\b/,
    /estrategia de conteudo/,
    /processo (de vendas|comercial|recorrente)/,
    /pipeline comercial/,
  ],
  /** redes sociais citadas como canal, sem estrutura → aquisicao 7 */
  aquisicaoRedes: [
    /\binstagram\b/,
    /\bfacebook\b/,
    /\btiktok\b/,
    /\blinkedin\b/,
    /\bredes sociais\b/,
    /\bposto\b/,
    /\bposts?\b/,
    /\bstories\b/,
    /\breels?\b/,
    /\bdivulgo\b/,
  ],
  /** apenas relacionamento / indicação → aquisicao 4 */
  aquisicaoIndicacao: [
    /indica/,
    /boca a boca/,
    /clientes? antig/,
    /\bamigos\b/,
    /\bconhecidos\b/,
    /\bparcerias?\b/,
  ],
  /** vazio / não sei → aquisicao 0 */
  semInfo: [/^nao sei/, /^nenhum/, /^nenhum/, /^nada$/, /^nao tenho/, /nao faco ideia/],

  /** evidência de estrutura de atendimento → atendimento 10 */
  atendimentoEstrutura: [
    /\bcrm\b/,
    /sistema de (gestao|atendimento)/,
    /\berp\b/,
    /software de (gestao|atendimento|agendamento)/,
    /\bchatbot\b/,
    /bot de atendimento/,
    /agenda(mento)? online/,
    /whatsapp business api/,
    /plataforma de atendimento/,
    /automac(ao|oes) (de|no) atendimento/,
    /processo (estruturado|padronizado) de atendimento/,
    /fluxo automatizado/,
  ],
  /** afirmação de que está tudo certo, sem prova de estrutura → atendimento 7 */
  atendimentoOrganizado: [
    /nada critico/,
    /\btranquilo\b/,
    /\btranquila\b/,
    /sem problema/,
    /tudo certo/,
    /tudo (sob )?controle/,
    /nenhuma dificuldade/,
    /nao (ha|tem|temos) (problema|dificuldade)/,
    /esta (tudo )?ok/,
    /ta tudo bem/,
    /nada demais/,
    /funciona bem/,
    /da conta/,
  ],
  /** processo manual / desorganização → atendimento 3 */
  atendimentoManual: [
    /\bmanual\b/,
    /\bplanilha\b/,
    /no papel/,
    /\bcaderno\b/,
    /anotac/,
    /na mao/,
    /na marra/,
    /\bme perco\b/,
    /nao consigo responder/,
    /demoro (pra|para) responder/,
    /responder todo mundo/,
    /dar seguimento/,
    /follow ?up manual/,
    /sem (agenda|sistema|controle)/,
    /agenda (desorganizada|baguncada|no papel)/,
    /tudo (na mao|no whatsapp|espalhado)/,
    /desorganiz/,
  ],
  /** problema severo explícito → atendimento 1 */
  atendimentoSevero: [
    /perco (muito|varios|varias)? ?(client|venda|orcament)/,
    /perdendo (client|venda|dinheiro|oportunidade)/,
    /deixo de (atender|vender|responder)/,
    /nao dou conta/,
    /nao consigo dar conta/,
    /nao dou vazao/,
    /\bcaotic/,
    /uma bagunca/,
    /descontrolad/,
    /fora de controle/,
    /nao consigo atender (todo mundo|a demanda)/,
  ],

  /** dor com peso comercial (dentro do campo dificuldade) → +6 */
  dorRelevante: [
    /client/,
    /\blead/,
    /venda/,
    /faturament/,
    /\bagenda/,
    /atendiment/,
    /orcament/,
    /responder/,
    /\bdemora/,
    /\bperc(o|a|endo)/,
    /organiz/,
    /process/,
    /\bconversa/,
    /\bproposta/,
    /crescer/,
  ],

  /** objetivo de crescimento → +12 */
  crescimento: [
    /cresc/,
    /\bescalar\b/,
    /\bexpandir\b/,
    /\bampliar\b/,
    /mais clientes/,
    /novos clientes/,
    /mais lead/,
    /aumentar (as )?(venda|faturament|clientes|receita)/,
    /vender mais/,
    /faturar mais/,
    /\bdobrar\b/,
    /\btriplicar\b/,
    /ganhar mercado/,
    /aumentar a base/,
  ],
  /** objetivo apenas exploratório → cap 6 */
  exploratorio: [
    /entender se/,
    /saber se/,
    /\bavaliar\b/,
    /dar uma olhada/,
    /so (olhando|pesquisando|curiando|quero entender|quero saber)/,
    /sem pressa/,
    /\bcuriosidade\b/,
    /ver se (vale|faz sentido|da)/,
    /entender melhor/,
  ],

  /**
   * Urgência identificável (qualquer texto longo) → 10.
   * `ja` sozinho fica DE FORA de propósito — em pt-BR quase sempre é "já
   * fiz / já pensei" (passado), não "resolver agora".
   */
  urgencia: [
    /\burgent/,
    /o quanto antes/,
    /\bquanto antes\b/,
    /\bimediat/,
    /para (ontem|ja)/,
    /\bparad[oa]\b/,
    /perdendo (client|venda|dinheiro|tempo|oportunidade)/,
    /\besse mes\b/,
    /\beste mes\b/,
    /\bessa semana\b/,
    /nao da mais/,
    /nao aguento mais/,
    /preciso resolver (ja|isso|agora|rapido)/,
    /preciso (disso )?(ja|agora|urgente|para ontem)/,
    /com pressa/,
    /o mais rapido/,
    /\bja nao\b/,
  ],

  /**
   * Evidência textual EXPLÍCITA de site defasado/ruim → gap
   * `site_possivelmente_defasado`. O formulário não pergunta sobre a
   * qualidade do site, então só o que o lead escreve conta — presença de
   * site NÃO dispara este gap.
   */
  siteDefasado: [
    /site\b[^.!?]{0,40}(antig|velho|desatualizad|defasad|ultrapassad|ruim|fraco|feio|horrivel|lent|quebrad|nao (converte|funciona|vende|carrega|e responsiv|presta)|fora do ar|da verg|de verg)/,
    /(antig|velho|desatualizad|defasad|ruim|fraco|feio|horrivel|precari)[^.!?]{0,25}\bsite\b/,
    /(refazer|reformular|refazendo|atualizar|modernizar|trocar|repaginar|reconstruir)[^.!?]{0,20}\bsite\b/,
    /\bsite\b[^.!?]{0,25}(precisa|precisamos|preciso|tem que|tem de)[^.!?]{0,20}(refaz|reform|atualiz|moderniz|melhor|mudar)/,
    /pagina\b[^.!?]{0,30}(antig|velha|desatualizad|defasad)/,
  ],
  /** ausência de automação declarada → gap ausencia_automacao */
  semAutomacao: [
    /sem automac/,
    /nao (tenho|temos|ha) automac/,
    /nada (e |esta )?automatiz/,
    /tudo (manual|na mao)/,
    /processo (todo )?manual/,
    /\brepetitiv/,
    /perco tempo com/,
    /\bretrabalho\b/,
    /faco tudo (na mao|manualmente)/,
  ],

  /** objetivo/observações puxam serviço Presença Digital */
  fitPresenca: [/\bsite\b/, /landing/, /\bpagina\b/, /presenca digital/, /profissionaliz/, /identidade (visual|digital)/],
  /** ... Automações */
  fitAutomacao: [/automatiz/, /responder/, /seguimento/, /agendament/, /\bprocesso\b/, /\bwhatsapp\b/, /integrac/, /\bcrm\b/, /organizar (o|os|a|as)? ?(atendiment|orcament|lead|contato)/],
  /** ... Aquisição e Performance */
  fitAquisicao: [/cresc/, /mais clientes/, /mais lead/, /\banunci/, /\bads\b/, /trafego/, /vender mais/, /captar/, /gerar lead/, /performance/],
  /** ... Conteúdo */
  fitConteudo: [/conteudo/, /autoridade/, /\bblog\b/, /\bmaterial\b/, /posicionar/, /\bartigo/, /\bvideo/, /\bpodcast/],
  /** ... Redes Sociais (gated: só se o objetivo fala disso) */
  fitRedes: [/redes sociais/, /\binstagram\b/, /\bmarca\b/, /engajament/, /\bseguidor/, /presenca nas redes/],
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));

/**
 * Marcas diacríticas combinantes (U+0300–U+036F). Construído via `RegExp` pra
 * não deixar caractere combinante solto no fonte (dispara `no-misleading-
 * character-class` no ESLint e é invisível no editor).
 */
const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

/** normaliza: sem acento, minúsculo, espaços colapsados */
function norm(v: string | undefined | null): string {
  return (v ?? "").normalize("NFD").replace(DIACRITICS, "").toLowerCase().replace(/\s+/g, " ").trim();
}

const anyMatch = (text: string, patterns: readonly RegExp[]) => patterns.some((re) => re.test(text));

/** campo textual "de verdade": tem tamanho mínimo e ao menos uma palavra */
function preenchido(v: string | undefined | null, min = 12): boolean {
  const t = (v ?? "").trim();
  return t.length >= min && /[a-zà-ÿ]{3,}/i.test(t);
}

/** URL/handle presente (o zod já garantiu o formato leniente) */
const presente = (v: string | undefined | null) => (v ?? "").trim().length > 0;

// ---------------------------------------------------------------------------
// Sinais derivados uma única vez
// ---------------------------------------------------------------------------

type AquisicaoTier = { pts: number; base: string; fraca: boolean; indicacao: boolean };
type AtendimentoTier = { pts: number; base: string; manual: boolean };

type Signals = {
  sitePresente: boolean;
  gbpPresente: boolean;
  igPresente: boolean;
  acqText: string;
  difText: string;
  objText: string;
  obsText: string;
  comoText: string; // comoConquistaClientes normalizado (= acqText, nome explícito)
  textoLongoAgregado: string; // dificuldade + objetivo + observacoes + comoConquista
  aquisicao: AquisicaoTier;
  atendimento: AtendimentoTier;
  urgente: boolean;
};

function classificarAquisicao(acqText: string): AquisicaoTier {
  if (!acqText || acqText.length < 3 || anyMatch(acqText, KW.semInfo)) {
    return { pts: 0, base: "comoConquistaClientes:vazio_ou_nao_sei", fraca: false, indicacao: false };
  }
  const temIndicacao = anyMatch(acqText, KW.aquisicaoIndicacao);

  if (anyMatch(acqText, KW.aquisicaoPaga) && !anyMatch(acqText, KW.aquisicaoPagaNegada)) {
    return { pts: PESOS.maturidade.aquisicao, base: "comoConquistaClientes:midia_paga", fraca: false, indicacao: temIndicacao };
  }
  if (anyMatch(acqText, KW.aquisicaoOrganicaEstrut)) {
    return { pts: 12, base: "comoConquistaClientes:organico_estruturado", fraca: false, indicacao: temIndicacao };
  }
  if (anyMatch(acqText, KW.aquisicaoRedes)) {
    return { pts: 7, base: "comoConquistaClientes:redes_sem_estrutura", fraca: true, indicacao: temIndicacao };
  }
  if (temIndicacao) {
    return { pts: 4, base: "comoConquistaClientes:apenas_indicacao", fraca: true, indicacao: true };
  }
  return { pts: 4, base: "comoConquistaClientes:sem_estrutura_clara", fraca: true, indicacao: false };
}

function classificarAtendimento(difText: string, comoText: string, obsText: string): AtendimentoTier {
  const largo = norm([difText, comoText, obsText].filter(Boolean).join(" "));

  if (anyMatch(difText, KW.atendimentoSevero)) {
    return { pts: 1, base: "dificuldade:problema_severo", manual: true };
  }
  if (anyMatch(difText, KW.atendimentoManual)) {
    return { pts: 3, base: "dificuldade:manual_ou_desorganizado", manual: true };
  }
  if (anyMatch(largo, KW.atendimentoEstrutura)) {
    return { pts: 10, base: "dificuldade:estrutura_comprovada", manual: false };
  }
  if (anyMatch(difText, KW.atendimentoOrganizado)) {
    return { pts: 7, base: "dificuldade:organizado_sem_automacao", manual: false };
  }
  return { pts: 5, base: "dificuldade:informacao_insuficiente", manual: false };
}

function buildSignals(d: DiagnosticoInput): Signals {
  const acqText = norm(d.comoConquistaClientes);
  const difText = norm(d.dificuldade);
  const objText = norm(d.objetivo);
  const obsText = norm(d.observacoes);
  const textoLongoAgregado = norm(
    [d.dificuldade, d.objetivo, d.observacoes, d.comoConquistaClientes].filter(Boolean).join(" ")
  );
  return {
    sitePresente: presente(d.site),
    gbpPresente: presente(d.googleBusiness),
    igPresente: presente(d.instagram),
    acqText,
    difText,
    objText,
    obsText,
    comoText: acqText,
    textoLongoAgregado,
    aquisicao: classificarAquisicao(acqText),
    atendimento: classificarAtendimento(difText, acqText, obsText),
    urgente: anyMatch(textoLongoAgregado, KW.urgencia),
  };
}

// ---------------------------------------------------------------------------
// Maturidade Digital (0–100)
// ---------------------------------------------------------------------------

function scoreMaturidade(d: DiagnosticoInput, s: Signals): { total: number; criterios: Criterio[] } {
  const criterios: Criterio[] = [];

  // Site 0–35
  let sitePts = 0;
  let siteBase = "site:ausente";
  if (s.sitePresente) {
    sitePts = 30;
    siteBase = "site:presente";
    if (/\bsite\b/.test(s.acqText) || /\bseo\b/.test(s.acqText) || /landing/.test(s.acqText) || /\bblog\b/.test(s.acqText)) {
      sitePts += 5;
      siteBase = "site:presente_e_usado_como_canal";
    }
  }
  criterios.push({ dimensao: "maturidade", criterio: "site", pontos: sitePts, max: PESOS.maturidade.site, base: siteBase });

  // Google Business 0–20
  const gbpPts = s.gbpPresente ? PESOS.maturidade.googleBusiness : 0;
  criterios.push({
    dimensao: "maturidade",
    criterio: "google_business",
    pontos: gbpPts,
    max: PESOS.maturidade.googleBusiness,
    base: s.gbpPresente ? "googleBusiness:presente" : "googleBusiness:ausente",
  });

  // Instagram / redes 0–15
  const igPts = s.igPresente ? PESOS.maturidade.instagram : 0;
  criterios.push({
    dimensao: "maturidade",
    criterio: "instagram",
    pontos: igPts,
    max: PESOS.maturidade.instagram,
    base: s.igPresente ? "instagram:presente" : "instagram:ausente",
  });

  // Estrutura de aquisição 0–20
  criterios.push({
    dimensao: "maturidade",
    criterio: "aquisicao",
    pontos: s.aquisicao.pts,
    max: PESOS.maturidade.aquisicao,
    base: s.aquisicao.base,
  });

  // Atendimento / automação 0–10
  criterios.push({
    dimensao: "maturidade",
    criterio: "atendimento",
    pontos: s.atendimento.pts,
    max: PESOS.maturidade.atendimento,
    base: s.atendimento.base,
  });

  void d;
  const total = clamp(sitePts + gbpPts + igPts + s.aquisicao.pts + s.atendimento.pts);
  return { total, criterios };
}

// ---------------------------------------------------------------------------
// Gaps — só com evidência
// ---------------------------------------------------------------------------

const GAP_TITULO: Record<GapCode, string> = {
  ausencia_site: "Ausência de site profissional",
  site_possivelmente_defasado: "Site possivelmente defasado (relatado pelo lead)",
  baixa_organizacao_presenca_digital: "Presença digital pouco organizada",
  presenca_google_ausente: "Baixa presença no Google (sem Google Business)",
  redes_sociais_ausentes: "Ausência de redes sociais",
  aquisicao_nao_estruturada: "Aquisição de clientes pouco estruturada",
  dependencia_de_indicacao: "Dependência de indicação / boca a boca",
  atendimento_manual: "Atendimento manual",
  ausencia_automacao: "Ausência de automação",
};

const gap = (codigo: GapCode, base: string): Gap => ({ codigo, titulo: GAP_TITULO[codigo], base });

function detectarGaps(d: DiagnosticoInput, s: Signals): Gap[] {
  const gaps: Gap[] = [];

  if (!s.sitePresente) gaps.push(gap("ausencia_site", "site:ausente"));

  // Só com evidência textual explícita — o formulário não pergunta sobre a
  // qualidade do site, então presença de site NÃO gera este gap.
  if (s.sitePresente && anyMatch(s.textoLongoAgregado, KW.siteDefasado)) {
    gaps.push(gap("site_possivelmente_defasado", "texto:relato_explicito_de_site_ruim"));
  }

  if (!s.gbpPresente) gaps.push(gap("presenca_google_ausente", "googleBusiness:ausente"));
  if (!s.igPresente) gaps.push(gap("redes_sociais_ausentes", "instagram:ausente"));

  // Tem rede social mas nenhum ponto de ancoragem próprio (site/GBP).
  if (s.igPresente && !s.sitePresente && !s.gbpPresente) {
    gaps.push(gap("baixa_organizacao_presenca_digital", "presenca:apenas_rede_social"));
  }

  // Aquisição fraca = redes sem estrutura / indicação / sem estrutura clara.
  // Campo vazio NÃO gera gap (evidência insuficiente).
  if (s.aquisicao.fraca) gaps.push(gap("aquisicao_nao_estruturada", s.aquisicao.base));
  if (s.aquisicao.indicacao && s.aquisicao.fraca) {
    gaps.push(gap("dependencia_de_indicacao", "comoConquistaClientes:indicacao"));
  }

  if (s.atendimento.manual) gaps.push(gap("atendimento_manual", s.atendimento.base));

  if (anyMatch(norm([d.dificuldade, d.observacoes].filter(Boolean).join(" ")), KW.semAutomacao)) {
    gaps.push(gap("ausencia_automacao", "texto:sem_automacao_declarada"));
  }

  return gaps;
}

// ---------------------------------------------------------------------------
// Serviços Noryos evidenciados (ordem = hierarquia comercial)
// ---------------------------------------------------------------------------

const HIERARQUIA_SERVICOS: ServicoNoryos[] = [
  "Presença Digital",
  "Automações",
  "Aquisição e Performance",
  "Conteúdo",
  "Redes Sociais",
];

function servicosEvidenciados(s: Signals, gaps: Gap[]): ServicoNoryos[] {
  const cod = new Set(gaps.map((g) => g.codigo));
  const set = new Set<ServicoNoryos>();
  const objObs = `${s.objText} ${s.obsText}`.trim();

  if (
    cod.has("ausencia_site") ||
    cod.has("site_possivelmente_defasado") ||
    cod.has("baixa_organizacao_presenca_digital") ||
    anyMatch(s.objText, KW.fitPresenca)
  ) {
    set.add("Presença Digital");
  }

  if (cod.has("atendimento_manual") || cod.has("ausencia_automacao") || anyMatch(s.objText, KW.fitAutomacao)) {
    set.add("Automações");
  }

  if (
    cod.has("aquisicao_nao_estruturada") ||
    cod.has("dependencia_de_indicacao") ||
    cod.has("presenca_google_ausente") ||
    anyMatch(s.objText, KW.fitAquisicao)
  ) {
    set.add("Aquisição e Performance");
  }

  if (anyMatch(objObs, KW.fitConteudo)) set.add("Conteúdo");

  // Gated: redes ausentes NÃO basta — o objetivo/observações precisam citar redes/marca.
  if (cod.has("redes_sociais_ausentes") && anyMatch(objObs, KW.fitRedes)) set.add("Redes Sociais");

  return HIERARQUIA_SERVICOS.filter((x) => set.has(x));
}

// ---------------------------------------------------------------------------
// Potencial Comercial (0–100)
// ---------------------------------------------------------------------------

function scorePotencial(
  d: DiagnosticoInput,
  s: Signals,
  evidenciados: ServicoNoryos[]
): { total: number; gapPts: number; criterios: Criterio[] } {
  const criterios: Criterio[] = [];

  // Gaps resolvíveis pela Noryos 0–35
  let gapPts = 0;
  if (!s.sitePresente) gapPts += 14;
  if (!s.gbpPresente) gapPts += 7;
  if (!s.igPresente) gapPts += 5;
  if (s.aquisicao.fraca) gapPts += 9;
  gapPts = Math.min(PESOS.potencial.gaps, gapPts);
  criterios.push({
    dimensao: "potencial",
    criterio: "gaps_noryos",
    pontos: gapPts,
    max: PESOS.potencial.gaps,
    base: `site_ausente:${!s.sitePresente} gbp_ausente:${!s.gbpPresente} redes_ausente:${!s.igPresente} aquisicao_fraca:${s.aquisicao.fraca}`,
  });

  // Dor / problema claro 0–20 (campo dificuldade)
  let dorPts = 0;
  let dorBase = "dificuldade:vazia";
  const difOrganizado = anyMatch(s.difText, KW.atendimentoOrganizado);
  if (preenchido(d.dificuldade) && !difOrganizado) {
    dorPts = 14;
    dorBase = "dificuldade:preenchida";
    if (anyMatch(s.difText, KW.dorRelevante)) {
      dorPts += 6;
      dorBase = "dificuldade:preenchida_com_dor_comercial";
    }
  } else if (difOrganizado) {
    dorBase = "dificuldade:sem_dor_declarada";
  }
  criterios.push({ dimensao: "potencial", criterio: "dor", pontos: dorPts, max: PESOS.potencial.dor, base: dorBase });

  // Objetivo de crescimento 0–25 (campo objetivo, + observações p/ crescimento)
  let objPts = 0;
  let objBase = "objetivo:vazio";
  if (preenchido(d.objetivo)) {
    if (anyMatch(s.objText, KW.exploratorio)) {
      objPts = 6;
      objBase = "objetivo:exploratorio";
    } else {
      objPts = 13;
      objBase = "objetivo:preenchido";
      if (anyMatch(s.objText, KW.crescimento) || anyMatch(s.obsText, KW.crescimento)) {
        objPts += 12;
        objBase = "objetivo:intencao_de_crescimento";
      }
    }
  }
  objPts = Math.min(PESOS.potencial.objetivo, objPts);
  criterios.push({ dimensao: "potencial", criterio: "objetivo", pontos: objPts, max: PESOS.potencial.objetivo, base: objBase });

  // Urgência 0–10
  const urgPts = s.urgente ? PESOS.potencial.urgencia : 0;
  criterios.push({
    dimensao: "potencial",
    criterio: "urgencia",
    pontos: urgPts,
    max: PESOS.potencial.urgencia,
    base: s.urgente ? "texto:urgencia_identificada" : "texto:sem_urgencia",
  });

  // Aderência aos serviços Noryos 0–10 (4 por categoria evidenciada)
  const aderPts = Math.min(PESOS.potencial.aderencia, evidenciados.length * 4);
  criterios.push({
    dimensao: "potencial",
    criterio: "aderencia_servicos",
    pontos: aderPts,
    max: PESOS.potencial.aderencia,
    base: `categorias_evidenciadas:${evidenciados.length}`,
  });

  const total = clamp(gapPts + dorPts + objPts + urgPts + aderPts);
  return { total, gapPts, criterios };
}

// ---------------------------------------------------------------------------
// Classificação, prioridade, próxima ação
// ---------------------------------------------------------------------------

export function faixaClassificacao(scorePotencial: number): Classificacao {
  if (scorePotencial >= 85) return "prioridade_comercial";
  if (scorePotencial >= 70) return "oportunidade_quente";
  if (scorePotencial >= 50) return "boa_oportunidade";
  if (scorePotencial >= 30) return "oportunidade_fria";
  return "baixa_prioridade";
}

function definirPrioridade(scorePotencial: number, urgente: boolean, gapPts: number): Prioridade {
  if (scorePotencial >= 85 && (urgente || gapPts >= 30)) return "critica";
  if (scorePotencial >= 60) return "alta";
  if (scorePotencial >= 30) return "media";
  return "baixa";
}

export const CLASSIFICACAO_LABEL: Record<Classificacao, string> = {
  baixa_prioridade: "Baixa prioridade",
  oportunidade_fria: "Oportunidade fria",
  boa_oportunidade: "Boa oportunidade",
  oportunidade_quente: "Oportunidade quente",
  prioridade_comercial: "Prioridade comercial",
};

export const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

const PROXIMA_ACAO_BASE: Record<Classificacao, string> = {
  prioridade_comercial: "Contato comercial em até 24h — agendar reunião de diagnóstico.",
  oportunidade_quente: "Contato em até 48h e agendar conversa.",
  boa_oportunidade: "Analisar presença digital e contatar em até 3 dias úteis.",
  oportunidade_fria: "Adicionar à nutrição — contato leve, sem prioridade de agenda.",
  baixa_prioridade: "Baixa prioridade no momento — registrar e revisitar em ciclo futuro.",
};

function montarProximaAcao(d: DiagnosticoInput, classificacao: Classificacao, urgente: boolean): string {
  let acao = PROXIMA_ACAO_BASE[classificacao];
  if (urgente) acao += " Lead informou urgência.";
  if (!preenchido(d.email, 5)) acao += " Contato só por WhatsApp (sem e-mail).";
  return acao;
}

// ---------------------------------------------------------------------------
// Entrada única
// ---------------------------------------------------------------------------

export function scoreDiagnostico(d: DiagnosticoInput): DiagnosticoScoring {
  const s = buildSignals(d);

  const mat = scoreMaturidade(d, s);
  const gaps = detectarGaps(d, s);
  const evidenciados = servicosEvidenciados(s, gaps);
  const pot = scorePotencial(d, s, evidenciados);

  const potencialComercial = pot.total;
  const classificacao = faixaClassificacao(potencialComercial);
  const prioridade = definirPrioridade(potencialComercial, s.urgente, pot.gapPts);

  return {
    scoringVersion: SCORING_VERSION,
    maturidadeDigital: mat.total,
    potencialComercial,
    classificacao,
    prioridade,
    gaps,
    servicosRecomendados: evidenciados.slice(0, 3),
    proximaAcao: montarProximaAcao(d, classificacao, s.urgente),
    qualidadeContato: {
      email: preenchido(d.email, 5),
      cidade: preenchido(d.cidade, 2),
      segmento: preenchido(d.segmento, 2),
    },
    criterios: [...mat.criterios, ...pot.criterios],
  };
}
