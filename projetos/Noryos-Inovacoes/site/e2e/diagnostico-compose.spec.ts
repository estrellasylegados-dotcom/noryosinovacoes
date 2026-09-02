import { test, expect } from "@playwright/test";
import {
  composeLegacyText,
  submissionToDiagnosticoInput,
} from "../src/lib/diagnostico-compose";
import { scoreDiagnostico } from "../src/lib/diagnostico-scoring";
import type { DiagnosticoSubmission } from "../src/app/diagnostico/schema";

/**
 * Testes unitários da ponte Form V2 → scoring V1 (`composeLegacyText`).
 * Função PURA — sem browser, sem servidor. Rodam com `npm run test:e2e`.
 *
 * O que garantem:
 *  - cada chip/opção vira a frase que o léxico do scoring V1 espera
 *    (aquisição paga/orgânica/redes/indicação/vazio; atendimento
 *    manual/severo; ausência de automação);
 *  - decisão U1: `prazo` alimenta a urgência (o_quanto_antes / ate_30_dias)
 *    ou o caráter exploratório (pesquisando) do scoring V1;
 *  - `organizado` / `estruturando` NÃO entram como "dificuldade" (não zeram
 *    o critério de dor de quem tem dor de aquisição real);
 *  - o texto composto respeita o teto do schema legado (< 2000).
 */

function sub(over: Partial<DiagnosticoSubmission> = {}): DiagnosticoSubmission {
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

const criterio = (s: DiagnosticoSubmission, slug: string) => {
  const r = scoreDiagnostico(submissionToDiagnosticoInput(s));
  return r.criterios.find((c) => c.criterio === slug);
};
const gapCodes = (s: DiagnosticoSubmission) =>
  scoreDiagnostico(submissionToDiagnosticoInput(s)).gaps.map((g) => g.codigo);

// ---------------------------------------------------------------------------
// Aquisição — canais → tier de maturidade (mesma escala do scoring V1)
// ---------------------------------------------------------------------------
test("canais: Google Ads / Meta Ads → mídia paga (20)", () => {
  expect(criterio(sub({ canais: ["google_ads"] }), "aquisicao")?.pontos).toBe(20);
  expect(criterio(sub({ canais: ["meta_ads", "indicacao"] }), "aquisicao")?.pontos).toBe(20);
});

test("canais: prospecção ativa / e-mail marketing / conteúdo e SEO → orgânico estruturado (12)", () => {
  expect(criterio(sub({ canais: ["prospeccao_ativa"] }), "aquisicao")?.pontos).toBe(12);
  expect(criterio(sub({ canais: ["email_marketing"] }), "aquisicao")?.pontos).toBe(12);
  expect(criterio(sub({ canais: ["conteudo_seo"] }), "aquisicao")?.pontos).toBe(12);
});

test("canais: Instagram/redes sem estrutura → 7", () => {
  expect(criterio(sub({ canais: ["instagram_redes"] }), "aquisicao")?.pontos).toBe(7);
  expect(criterio(sub({ canais: ["instagram_redes", "indicacao"] }), "aquisicao")?.pontos).toBe(7);
});

test("canais: só indicação / parcerias → 4 e gera dependência de indicação", () => {
  expect(criterio(sub({ canais: ["indicacao"] }), "aquisicao")?.pontos).toBe(4);
  expect(gapCodes(sub({ canais: ["indicacao"] }))).toContain("dependencia_de_indicacao");
});

test("canais vazio → 0 e NÃO gera gap de aquisição (evidência insuficiente)", () => {
  expect(criterio(sub({ canais: [] }), "aquisicao")?.pontos).toBe(0);
  expect(gapCodes(sub({ canais: [] }))).not.toContain("aquisicao_nao_estruturada");
});

test("canais: nota livre 'pensei em anúncio mas nunca fiz' não vira mídia paga", () => {
  const pts = criterio(
    sub({ canais: ["indicacao"], aquisicaoNota: "Já pensei em anúncio mas nunca fiz." }),
    "aquisicao"
  )?.pontos;
  expect(pts).toBeLessThan(12);
});

// ---------------------------------------------------------------------------
// Atendimento — ferramentas + organização + dificuldade principal
// ---------------------------------------------------------------------------
test("ferramentas: CRM / ERP / chatbot / agenda online → estrutura comprovada (10)", () => {
  expect(criterio(sub({ ferramentas: ["crm"] }), "atendimento")?.pontos).toBe(10);
  expect(criterio(sub({ ferramentas: ["agenda_online"] }), "atendimento")?.pontos).toBe(10);
});

test("ferramentas: 'Nenhuma ferramenta específica' → gap de ausência de automação", () => {
  expect(gapCodes(sub({ ferramentas: ["nenhuma"] }))).toContain("ausencia_automacao");
});

test("organização 'manual' → atendimento manual (3) e gap atendimento_manual", () => {
  const s = sub({ organizacao: "manual" });
  expect(criterio(s, "atendimento")?.pontos).toBe(3);
  expect(gapCodes(s)).toContain("atendimento_manual");
});

test("organização 'perco oportunidades' → problema severo (tier baixo) e gap atendimento_manual", () => {
  const s = sub({ organizacao: "perco_oportunidades" });
  expect(criterio(s, "atendimento")?.pontos).toBeLessThanOrEqual(2);
  expect(gapCodes(s)).toContain("atendimento_manual");
});

test("dificuldade principal 'falta_automacao' → gap ausencia_automacao + atendimento manual", () => {
  const s = sub({ dificuldadePrincipal: "falta_automacao" });
  expect(gapCodes(s)).toEqual(expect.arrayContaining(["ausencia_automacao", "atendimento_manual"]));
});

test("'organizado' NÃO zera o critério de dor de quem tem dor de aquisição real", () => {
  const s = sub({ organizacao: "organizado", dificuldadePrincipal: "poucos_clientes" });
  // dor deve pontuar: campo dificuldade preenchido + dor comercial ('cliente'/'lead')
  expect(criterio(s, "dor")?.pontos).toBeGreaterThanOrEqual(14);
});

test("'organizado' sem dificuldade principal → dificuldade legada vazia, dor 0", () => {
  const s = sub({ organizacao: "organizado", dificuldadePrincipal: "" });
  expect(composeLegacyText(s).dificuldade).toBe("");
  expect(criterio(s, "dor")?.pontos).toBe(0);
});

// ---------------------------------------------------------------------------
// Objetivo + prazo (decisão U1)
// ---------------------------------------------------------------------------
test("prazo 'o_quanto_antes' → urgência pontua no scoring V1", () => {
  expect(criterio(sub({ prazo: "o_quanto_antes" }), "urgencia")?.pontos).toBe(10);
});

test("prazo 'ate_30_dias' → urgência pontua", () => {
  expect(criterio(sub({ prazo: "ate_30_dias" }), "urgencia")?.pontos).toBe(10);
});

test("prazo 'ate_90_dias' e '3_a_6_meses' → SEM urgência", () => {
  expect(criterio(sub({ prazo: "ate_90_dias" }), "urgencia")?.pontos).toBe(0);
  expect(criterio(sub({ prazo: "3_a_6_meses" }), "urgencia")?.pontos).toBe(0);
});

test("prazo 'pesquisando' → objetivo tratado como exploratório (trava em 6), sem urgência", () => {
  const s = sub({ objetivoPrincipal: "mais_clientes", prazo: "pesquisando" });
  expect(criterio(s, "objetivo")?.pontos).toBe(6);
  expect(criterio(s, "urgencia")?.pontos).toBe(0);
});

test("objetivo 'entendendo' → exploratório mesmo com prazo curto", () => {
  const s = sub({ objetivoPrincipal: "entendendo", prazo: "o_quanto_antes" });
  expect(criterio(s, "objetivo")?.pontos).toBe(6);
});

test("objetivo 'mais_clientes' + prazo normal → crescimento pontua (25)", () => {
  const s = sub({ objetivoPrincipal: "mais_clientes", prazo: "ate_90_dias" });
  expect(criterio(s, "objetivo")?.pontos).toBe(25);
});

// ---------------------------------------------------------------------------
// Robustez
// ---------------------------------------------------------------------------
test("texto composto respeita o teto do schema legado (< 2000 por campo)", () => {
  const big = "x".repeat(5000);
  const s = sub({
    aquisicaoNota: big,
    dificuldadeNota: big,
    objetivoNota: big,
    canais: ["outro"],
    canaisOutro: big.slice(0, 160),
  });
  const t = composeLegacyText(s);
  for (const v of Object.values(t)) expect(v.length).toBeLessThan(2000);
});

test("submissão mínima (só obrigatórios) não quebra e gera score v1", () => {
  const r = scoreDiagnostico(submissionToDiagnosticoInput(sub()));
  expect(r.scoringVersion).toBe("v1");
  expect(r.potencialComercial).toBeGreaterThanOrEqual(0);
  expect(r.potencialComercial).toBeLessThanOrEqual(100);
});
