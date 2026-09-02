import { test, expect } from "@playwright/test";
import {
  scoreDiagnostico,
  faixaClassificacao,
  SCORING_VERSION,
  type DiagnosticoScoring,
} from "../src/lib/diagnostico-scoring";
import { submissionToDiagnosticoInput } from "../src/lib/diagnostico-compose";
import type { DiagnosticoInput, DiagnosticoSubmission } from "../src/app/diagnostico/schema";

/**
 * Testes unitários do scoring V1 (função PURA — sem browser, sem servidor).
 * Rodam junto da suíte Playwright (`npm run test:e2e` / `npm run quality`).
 *
 * Regras finais V1 exercitadas aqui (ver src/lib/diagnostico-scoring.ts):
 *  - Maturidade 100: site 35 / GBP 20 / IG 15 / aquisição 20 / atendimento 10
 *  - Potencial   100: gaps 35 / dor 20 / objetivo 25 / urgência 10 / aderência 10
 *  - Aquisição: paga 20 · orgânico ESTRUTURADO 12 · redes s/ estrutura 7 · indicação 4 · vazio 0
 *  - Atendimento: CRM/sistema 10 · organizado s/ automação 7 · sem info 5 · manual 3 · severo 0–2
 *  - `site_possivelmente_defasado` só com evidência textual explícita
 *  - contato NÃO entra no score (vai em `qualidadeContato`)
 *  - 5 faixas fixas; emoji no e-mail é problema do e-mail, não do scoring
 */

function input(over: Partial<DiagnosticoInput> = {}): DiagnosticoInput {
  return {
    nomeEmpresa: "Empresa Teste",
    responsavel: "Fulano",
    whatsapp: "51999990000",
    email: "",
    cidade: "",
    segmento: "",
    site: "",
    instagram: "",
    googleBusiness: "",
    comoConquistaClientes: "",
    dificuldade: "",
    objetivo: "",
    observacoes: "",
    consentimento: true,
    ...over,
  } as DiagnosticoInput;
}

const criterio = (r: DiagnosticoScoring, slug: string) =>
  r.criterios.find((c) => c.criterio === slug);
const gapCodes = (r: DiagnosticoScoring) => r.gaps.map((g) => g.codigo);

// ---------------------------------------------------------------------------
// 1. Maturidade baixa + potencial alto
// ---------------------------------------------------------------------------
test("empresa sem estrutura digital + dor + crescimento + urgência → maturidade baixa, potencial máximo", () => {
  const r = scoreDiagnostico(
    input({
      email: "marina@studiobella.com",
      cidade: "Porto Alegre",
      segmento: "Estética",
      comoConquistaClientes: "Só indicação de clientes antigas e boca a boca.",
      dificuldade:
        "Perco cliente porque não consigo responder o WhatsApp a tempo e não tenho agenda organizada.",
      objetivo:
        "Quero crescer e ter mais clientes novas todo mês, parar de depender só de indicação. Preciso urgente disso.",
    })
  );

  expect(r.maturidadeDigital).toBe(5);
  expect(r.potencialComercial).toBe(100);
  expect(r.classificacao).toBe("prioridade_comercial");
  expect(r.prioridade).toBe("critica");
  expect(gapCodes(r)).toEqual(
    expect.arrayContaining([
      "ausencia_site",
      "presenca_google_ausente",
      "redes_sociais_ausentes",
      "aquisicao_nao_estruturada",
      "dependencia_de_indicacao",
      "atendimento_manual",
    ])
  );
  expect(r.servicosRecomendados).toEqual([
    "Presença Digital",
    "Automações",
    "Aquisição e Performance",
  ]);
  expect(r.proximaAcao).toContain("24h");
  expect(r.proximaAcao).toContain("urgência");
});

// ---------------------------------------------------------------------------
// 2. Maturidade alta + potencial baixo
// ---------------------------------------------------------------------------
test("empresa estruturada, sem dor e objetivo só exploratório → maturidade alta, potencial baixo", () => {
  const r = scoreDiagnostico(
    input({
      site: "contabilapice.com.br",
      instagram: "@contabilapice",
      googleBusiness: "https://g.page/contabil-apice",
      comoConquistaClientes: "Google Ads, SEO no blog e indicações. Temos CRM e time comercial.",
      dificuldade: "Nada crítico, está tranquilo.",
      objetivo: "Só quero entender se dá pra melhorar alguma coisa.",
    })
  );

  expect(r.maturidadeDigital).toBe(100);
  expect(r.potencialComercial).toBe(6);
  expect(r.classificacao).toBe("baixa_prioridade");
  expect(r.prioridade).toBe("baixa");
  expect(r.gaps).toHaveLength(0);
  expect(r.servicosRecomendados).toHaveLength(0);
  expect(r.qualidadeContato).toEqual({ email: false, cidade: false, segmento: false });
  expect(r.proximaAcao).toContain("WhatsApp");
});

// ---------------------------------------------------------------------------
// 3. Oportunidade intermediária
// ---------------------------------------------------------------------------
test("empresa com IG/GBP mas sem site, aquisição fraca e atendimento manual → boa oportunidade", () => {
  const r = scoreDiagnostico(
    input({
      email: "jonas@marcenarianorte.com",
      cidade: "Joinville",
      segmento: "Móveis planejados",
      instagram: "instagram.com/marcenarianorte",
      googleBusiness: "https://g.page/marcenaria-norte",
      comoConquistaClientes: "Instagram e indicação. Já pensei em anúncio mas nunca fiz.",
      dificuldade:
        "Chega bastante orçamento pelo Instagram mas me perco pra responder e dar seguimento.",
      objetivo: "Queria ter um site pra passar mais confiança e organizar os orçamentos.",
    })
  );

  expect(r.maturidadeDigital).toBe(45);
  expect(r.potencialComercial).toBe(66);
  expect(r.classificacao).toBe("boa_oportunidade");
  expect(r.prioridade).toBe("alta");
  expect(r.servicosRecomendados).toEqual([
    "Presença Digital",
    "Automações",
    "Aquisição e Performance",
  ]);
  // "Instagram e indicação" NÃO é orgânico estruturado
  expect(criterio(r, "aquisicao")?.pontos).toBe(7);
  // sem evidência textual de site ruim → NÃO gera o gap
  expect(gapCodes(r)).not.toContain("site_possivelmente_defasado");
});

// ---------------------------------------------------------------------------
// 4. Formulário só com o obrigatório (poucos dados opcionais)
// ---------------------------------------------------------------------------
test("apenas campos obrigatórios: não quebra, scores nos limites, gaps só estruturais", () => {
  const r = scoreDiagnostico(input());

  expect(r.maturidadeDigital).toBeGreaterThanOrEqual(0);
  expect(r.maturidadeDigital).toBeLessThanOrEqual(100);
  expect(r.potencialComercial).toBeGreaterThanOrEqual(0);
  expect(r.potencialComercial).toBeLessThanOrEqual(100);

  // sem texto → nenhum gap que dependa de evidência textual
  expect(gapCodes(r)).not.toContain("atendimento_manual");
  expect(gapCodes(r)).not.toContain("ausencia_automacao");
  expect(gapCodes(r)).not.toContain("dependencia_de_indicacao");
  expect(gapCodes(r)).not.toContain("aquisicao_nao_estruturada");
  expect(gapCodes(r)).not.toContain("site_possivelmente_defasado");
  // só os buracos objetivos (presença)
  expect(gapCodes(r)).toEqual(
    expect.arrayContaining(["ausencia_site", "presenca_google_ausente", "redes_sociais_ausentes"])
  );
  expect(r.servicosRecomendados.length).toBeLessThanOrEqual(3);
});

// ---------------------------------------------------------------------------
// 5. Serviços recomendados coerentes com gaps/objetivo
// ---------------------------------------------------------------------------
test("serviços derivam dos gaps e da hierarquia comercial, sem redes sociais sem menção", () => {
  const r = scoreDiagnostico(
    input({
      instagram: "@loja",
      googleBusiness: "g.page/loja",
      site: "loja.com.br",
      dificuldade: "Respondo tudo no WhatsApp na mão e me perco no seguimento.",
      objetivo: "Quero automatizar o atendimento e organizar os processos.",
    })
  );

  expect(r.servicosRecomendados).toContain("Automações");
  // IG presente e objetivo não fala de redes/marca → NÃO recomenda "Redes Sociais"
  expect(r.servicosRecomendados).not.toContain("Redes Sociais");
  // ordem segue a hierarquia (Presença → Automações → Aquisição → Conteúdo → Redes)
  const ordem = ["Presença Digital", "Automações", "Aquisição e Performance", "Conteúdo", "Redes Sociais"];
  const idxs = r.servicosRecomendados.map((s) => ordem.indexOf(s));
  expect(idxs).toEqual([...idxs].sort((a, b) => a - b));
});

// ---------------------------------------------------------------------------
// 6. Não recomenda todos os serviços por padrão
// ---------------------------------------------------------------------------
test("nunca devolve mais de 3 serviços e não recomenda nada sem evidência", () => {
  const semNada = scoreDiagnostico(
    input({
      site: "x.com.br",
      instagram: "@x",
      googleBusiness: "g.page/x",
      comoConquistaClientes: "Google Ads e SEO com funil e CRM.",
      dificuldade: "Está tudo tranquilo, funciona bem.",
      objetivo: "Sem pressa, só quero entender se dá pra melhorar.",
    })
  );
  expect(semNada.servicosRecomendados).toHaveLength(0);

  const muito = scoreDiagnostico(
    input({
      comoConquistaClientes: "Só boca a boca.",
      dificuldade: "Faço tudo manual, planilha, me perco no atendimento.",
      objetivo:
        "Quero site novo, automatizar atendimento, crescer com anúncio, produzir conteúdo de autoridade e cuidar das redes sociais e da marca.",
    })
  );
  expect(muito.servicosRecomendados.length).toBeLessThanOrEqual(3);
});

// ---------------------------------------------------------------------------
// 7. Gaps só com evidência
// ---------------------------------------------------------------------------
test("site presente sem queixa → sem gap de site; com queixa textual → com gap", () => {
  const semQueixa = scoreDiagnostico(
    input({ site: "meusite.com.br", instagram: "@x", googleBusiness: "g.page/x" })
  );
  expect(gapCodes(semQueixa)).not.toContain("site_possivelmente_defasado");
  expect(gapCodes(semQueixa)).not.toContain("ausencia_site");

  const comQueixa = scoreDiagnostico(
    input({
      site: "meusite.com.br",
      instagram: "@x",
      googleBusiness: "g.page/x",
      objetivo: "Meu site é antigo e não converte, preciso refazer.",
    })
  );
  expect(gapCodes(comQueixa)).toContain("site_possivelmente_defasado");
});

test("aquisição vazia não gera gap de aquisição (evidência insuficiente)", () => {
  const r = scoreDiagnostico(input({ site: "x.com", instagram: "@x", googleBusiness: "g.page/x" }));
  expect(gapCodes(r)).not.toContain("aquisicao_nao_estruturada");
  expect(gapCodes(r)).not.toContain("dependencia_de_indicacao");
});

// ---------------------------------------------------------------------------
// 8. Limites 0–100
// ---------------------------------------------------------------------------
test("scores ficam sempre entre 0 e 100 (entrada vazia e entrada saturada)", () => {
  const vazio = scoreDiagnostico(input());
  const saturado = scoreDiagnostico(
    input({
      comoConquistaClientes: "só indicação e boca a boca, sem nada estruturado",
      dificuldade:
        "perco cliente todo dia, não dou conta, tudo manual na planilha, urgente, perdendo venda",
      objetivo:
        "preciso crescer muito, escalar, mais clientes, vender mais, faturar mais, site novo, automação, anúncio, conteúdo, redes sociais — para ontem",
      observacoes: "urgente, o quanto antes, não aguento mais",
    })
  );

  for (const r of [vazio, saturado]) {
    expect(r.maturidadeDigital).toBeGreaterThanOrEqual(0);
    expect(r.maturidadeDigital).toBeLessThanOrEqual(100);
    expect(r.potencialComercial).toBeGreaterThanOrEqual(0);
    expect(r.potencialComercial).toBeLessThanOrEqual(100);
  }
  expect(saturado.potencialComercial).toBe(100);
  expect(saturado.classificacao).toBe("prioridade_comercial");
});

// ---------------------------------------------------------------------------
// 9. Classificação por faixa
// ---------------------------------------------------------------------------
test("faixaClassificacao respeita as fronteiras 30/50/70/85", () => {
  expect(faixaClassificacao(0)).toBe("baixa_prioridade");
  expect(faixaClassificacao(29)).toBe("baixa_prioridade");
  expect(faixaClassificacao(30)).toBe("oportunidade_fria");
  expect(faixaClassificacao(49)).toBe("oportunidade_fria");
  expect(faixaClassificacao(50)).toBe("boa_oportunidade");
  expect(faixaClassificacao(69)).toBe("boa_oportunidade");
  expect(faixaClassificacao(70)).toBe("oportunidade_quente");
  expect(faixaClassificacao(84)).toBe("oportunidade_quente");
  expect(faixaClassificacao(85)).toBe("prioridade_comercial");
  expect(faixaClassificacao(100)).toBe("prioridade_comercial");
});

// ---------------------------------------------------------------------------
// 10. Versão do scoring
// ---------------------------------------------------------------------------
test("scoringVersion é sempre 'v1'", () => {
  expect(SCORING_VERSION).toBe("v1");
  expect(scoreDiagnostico(input()).scoringVersion).toBe("v1");
});

// ---------------------------------------------------------------------------
// Ajuste 1 — tiers de aquisição (maturidade)
// ---------------------------------------------------------------------------
test("aquisição: mídia paga 20 · orgânico estruturado 12 · redes sem estrutura 7 · indicação 4 · vazio 0", () => {
  const pts = (como: string) =>
    criterio(scoreDiagnostico(input({ comoConquistaClientes: como })), "aquisicao")?.pontos;

  expect(pts("Rodamos Google Ads e Meta Ads o ano todo.")).toBe(20);
  expect(pts("Temos SEO, funil de e-mail marketing e CRM.")).toBe(12);
  expect(pts("Instagram e indicação.")).toBe(7);
  expect(pts("Divulgo nas redes sociais e posto todo dia.")).toBe(7);
  expect(pts("Clientes vêm pelo Instagram.")).toBe(7);
  expect(pts("Só indicação e boca a boca.")).toBe(4);
  expect(pts("")).toBe(0);
  expect(pts("Não sei dizer.")).toBe(0);
});

test("aquisição: 'pensei em anúncio mas nunca fiz' não conta como mídia paga", () => {
  const pts = criterio(
    scoreDiagnostico(input({ comoConquistaClientes: "Já pensei em anúncio mas nunca fiz." })),
    "aquisicao"
  )?.pontos;
  expect(pts).toBeLessThan(12);
});

// ---------------------------------------------------------------------------
// Ajuste 3 — tiers de atendimento (maturidade)
// ---------------------------------------------------------------------------
test("atendimento: 'nada crítico' sozinho vale 7, não 10", () => {
  const r = scoreDiagnostico(input({ dificuldade: "Nada crítico, está tudo tranquilo." }));
  expect(criterio(r, "atendimento")?.pontos).toBe(7);
});

test("atendimento: CRM/sistema comprovado 10 · vazio 5 · manual 3 · severo 1", () => {
  const pts = (dif: string) =>
    criterio(scoreDiagnostico(input({ dificuldade: dif })), "atendimento")?.pontos;

  expect(pts("Usamos CRM e chatbot com fluxo automatizado.")).toBe(10);
  expect(pts("")).toBe(5);
  expect(pts("É tudo no caderno e na planilha, bem manual.")).toBe(3);
  expect(pts("Perco cliente direto, não dou conta da demanda.")).toBe(1);
});

// ---------------------------------------------------------------------------
// Contato fora do score
// ---------------------------------------------------------------------------
test("completar e-mail/cidade/segmento NÃO muda o potencial comercial", () => {
  const base = {
    comoConquistaClientes: "Só indicação.",
    dificuldade: "Me perco pra responder os clientes.",
    objetivo: "Quero crescer e ter mais clientes.",
  };
  const semContato = scoreDiagnostico(input(base));
  const comContato = scoreDiagnostico(
    input({ ...base, email: "a@b.com", cidade: "Curitiba", segmento: "Serviços" })
  );
  expect(comContato.potencialComercial).toBe(semContato.potencialComercial);
  expect(comContato.maturidadeDigital).toBe(semContato.maturidadeDigital);
  expect(comContato.qualidadeContato).toEqual({ email: true, cidade: true, segmento: true });
});

// ---------------------------------------------------------------------------
// Form V2 → scoring V1 (compatibilidade) — asserta FAIXA, não número exato.
// O scoring V1 não mudou; o Form V2 melhora a ORIGEM do sinal. Os 3 personas
// reproduzem o espalhamento V1 (ver a proposta da Fase 1).
// ---------------------------------------------------------------------------
function submission(over: Partial<DiagnosticoSubmission> = {}): DiagnosticoSubmission {
  return {
    nomeEmpresa: "Empresa Teste",
    responsavel: "Fulano",
    whatsapp: "51999990000",
    email: "",
    cidade: "",
    segmento: "",
    porte: "",
    presenca: [],
    site: "",
    instagram: "",
    googleBusiness: "",
    canais: [],
    canaisOutro: "",
    aquisicaoNota: "",
    ferramentas: [],
    organizacao: "",
    dificuldadePrincipal: "",
    dificuldadeOutro: "",
    dificuldadeNota: "",
    objetivoPrincipal: "mais_clientes",
    objetivoOutro: "",
    objetivoNota: "",
    prazo: "ate_90_dias",
    consentimento: true,
    ...over,
  } as DiagnosticoSubmission;
}
const scoreV2 = (s: DiagnosticoSubmission) => scoreDiagnostico(submissionToDiagnosticoInput(s));

test("V2 — lead FORTE (sem site, indicação/IG, atendimento ruim, crescer, o quanto antes) → prioridade comercial", () => {
  const r = scoreV2(
    submission({
      email: "carla@odonto.com",
      cidade: "Campinas",
      segmento: "Odontologia",
      porte: "6_20",
      presenca: ["instagram", "google_perfil"],
      instagram: "@odontosorriso",
      googleBusiness: "https://g.page/odonto-sorriso",
      canais: ["indicacao", "instagram_redes"],
      aquisicaoNota: "Quase tudo é indicação e Instagram. Impulsionei post sem estratégia.",
      ferramentas: ["whatsapp_comum", "planilhas"],
      organizacao: "perco_oportunidades",
      dificuldadePrincipal: "atendimento_desorganizado",
      dificuldadeNota: "Some paciente entre o orçamento e a marcação.",
      objetivoPrincipal: "mais_clientes",
      objetivoNota: "Quero crescer e parar de depender de indicação, montar um processo.",
      prazo: "o_quanto_antes",
    })
  );
  expect(r.scoringVersion).toBe("v1");
  expect(r.potencialComercial).toBeGreaterThanOrEqual(82);
  expect(r.classificacao).toBe("prioridade_comercial");
  expect(r.prioridade).toBe("critica");
  expect(r.maturidadeDigital).toBeLessThanOrEqual(55);
  expect(r.servicosRecomendados).toEqual([
    "Presença Digital",
    "Automações",
    "Aquisição e Performance",
  ]);
  expect(r.proximaAcao).toContain("24h");
  expect(r.proximaAcao).toContain("urgência");
});

test("V2 — lead INTERMEDIÁRIO (site+IG+GBP, IG/indicação, manual, automatizar, 90 dias) → boa oportunidade", () => {
  const r = scoreV2(
    submission({
      cidade: "Joinville",
      segmento: "Móveis planejados",
      porte: "2_5",
      presenca: ["site", "instagram", "google_perfil"],
      site: "marcenarianorte.com.br",
      instagram: "instagram.com/marcenarianorte",
      googleBusiness: "https://g.page/marcenaria-norte",
      canais: ["instagram_redes", "indicacao"],
      ferramentas: ["whatsapp_business", "planilhas"],
      organizacao: "manual",
      dificuldadePrincipal: "falta_automacao",
      objetivoPrincipal: "automatizar_atendimento",
      objetivoNota: "Chega bastante orçamento pelo Instagram mas me perco pra dar seguimento.",
      prazo: "ate_90_dias",
    })
  );
  expect(r.scoringVersion).toBe("v1");
  expect(r.classificacao).toBe("boa_oportunidade");
  expect(r.potencialComercial).toBeGreaterThanOrEqual(45);
  expect(r.potencialComercial).toBeLessThanOrEqual(69);
  expect(["media", "alta"]).toContain(r.prioridade);
  expect(r.maturidadeDigital).toBeGreaterThanOrEqual(55);
  expect(r.servicosRecomendados).toContain("Automações");
});

test("V2 — lead EXPLORATÓRIO (tudo pronto, Ads+SEO+CRM, organizado, entendendo, pesquisando) → baixa prioridade", () => {
  const r = scoreV2(
    submission({
      segmento: "Contabilidade",
      porte: "21_50",
      presenca: ["site", "instagram", "google_perfil", "blog"],
      site: "contabilapice.com.br",
      instagram: "@contabilapice",
      googleBusiness: "https://g.page/contabil-apice",
      canais: ["google_ads", "conteudo_seo", "indicacao", "email_marketing"],
      aquisicaoNota: "Temos time comercial e CRM.",
      ferramentas: ["crm", "sistema_proprio", "agenda_online"],
      organizacao: "organizado",
      dificuldadePrincipal: "",
      objetivoPrincipal: "entendendo",
      objetivoNota: "Só quero saber se dá pra melhorar alguma coisa.",
      prazo: "pesquisando",
    })
  );
  expect(r.scoringVersion).toBe("v1");
  expect(r.classificacao).toBe("baixa_prioridade");
  expect(r.potencialComercial).toBeLessThanOrEqual(15);
  expect(r.prioridade).toBe("baixa");
  expect(r.gaps).toHaveLength(0);
  expect(r.servicosRecomendados).toHaveLength(0);
  expect(r.maturidadeDigital).toBeGreaterThanOrEqual(90);
});
