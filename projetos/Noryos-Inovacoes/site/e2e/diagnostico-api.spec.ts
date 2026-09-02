import { test, expect, type APIRequestContext } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * Testes de contrato do endpoint POST /api/diagnostico — Form V2.
 * Pipeline anti-spam, Turnstile, rate limit, campo cruzado (link obrigatório)
 * e fluxo persistir → notificar, com respostas ESTRUTURADAS.
 *
 * Servidor sob teste (ver playwright.config.ts → webServer.env):
 *   DIAGNOSTIC_EMAIL_PROVIDER=mock             → e-mail vai pra .data/diagnostico.email-mock.jsonl
 *   DIAGNOSTIC_ALLOW_FILE_FALLBACK=1           → persistência no fallback local (sem Supabase)
 *   DIAGNOSTIC_RATELIMIT_SHORT_MAX=3 / _WINDOW_MS=2500   → janela curta
 *   DIAGNOSTIC_RATELIMIT_LONG_MAX=5  / _WINDOW_MS=12000  → janela longa
 *   TURNSTILE_MODE=mock                        → token com "pass" = ok; ausente/outro = 403
 *
 * O scoring V1 NÃO mudou (mesmos pesos/faixas, scoring_version="v1"). O Form
 * V2 grava também: form_version="v2", respostas jsonb, prazo,
 * objetivo_principal, porte. Colunas legadas seguem sendo gravadas.
 *
 * Isolamento: cada caso usa um X-Forwarded-For sintético próprio (chave do
 * rate limit) e um nome de empresa único (chave de dedupe).
 */

const ENDPOINT = "/api/diagnostico";
const RL_SHORT_MAX = 3;
const RL_SHORT_WINDOW_MS = 2500;
const RL_LONG_MAX = 5;
const EMAIL_MOCK = path.join(process.cwd(), ".data", "diagnostico.email-mock.jsonl");
const STORE = path.join(process.cwd(), ".data", "diagnostico.local.jsonl");

let seq = 0;

function readJsonl(file: string): Array<Record<string, unknown>> {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
}
const emailsFor = (empresa: string) =>
  readJsonl(EMAIL_MOCK).filter((e) => String(e.subject ?? "").includes(empresa));
const recordsFor = (empresa: string) =>
  readJsonl(STORE).filter((r) => r.nome_empresa === empresa);

function basePayload(overrides: Record<string, unknown> = {}) {
  seq += 1;
  const empresa = `TESTE NORYOS QA ${Date.now()}-${seq}`;
  return {
    empresa,
    body: {
      nomeEmpresa: empresa,
      responsavel: "Rafael Teste",
      whatsapp: "11999998888",
      email: "qa+diagnostico@example.com",
      cidade: "Porto Alegre",
      segmento: "Serviços",
      porte: "2_5",
      presenca: [],
      site: "",
      instagram: "",
      googleBusiness: "",
      canais: ["indicacao"],
      canaisOutro: "",
      aquisicaoNota: "",
      ferramentas: [],
      organizacao: "",
      dificuldadePrincipal: "",
      dificuldadeOutro: "",
      dificuldadeNota: "",
      objetivoPrincipal: "organizar_operacao",
      objetivoOutro: "",
      objetivoNota: "",
      prazo: "ate_90_dias",
      consentimento: true,
      startedAt: Date.now() - 10_000, // passa do tempo mínimo de preenchimento
      turnstileToken: "pass", // TURNSTILE_MODE=mock aceita qualquer token com "pass"
      ...overrides,
    },
  };
}

function post(request: APIRequestContext, body: unknown, ip: string, init: Record<string, unknown> = {}) {
  return request.post(ENDPOINT, {
    headers: { "Content-Type": "application/json", "X-Forwarded-For": ip },
    data: body,
    ...init,
  });
}

test.describe("POST /api/diagnostico — anti-spam, rate limit e contrato (V2)", () => {
  test("GET não é permitido (405)", async ({ request }) => {
    const res = await request.get(ENDPOINT);
    expect(res.status()).toBe(405);
    expect(res.headers()["allow"]).toContain("POST");
  });

  test("Content-Type não-JSON é rejeitado (415)", async ({ request }) => {
    const res = await request.post(ENDPOINT, {
      headers: { "Content-Type": "text/plain", "X-Forwarded-For": "10.1.0.1" },
      data: "nomeEmpresa=Teste",
    });
    expect(res.status()).toBe(415);
  });

  test("JSON inválido é rejeitado (400), sem stack trace", async ({ request }) => {
    const res = await request.post(ENDPOINT, {
      headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.1.0.2" },
      data: "{ isto não é json ",
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(String(body.error)).not.toMatch(/JSON|SyntaxError|stack|at .*\(/i);
  });

  test("payload acima do limite é rejeitado (413)", async ({ request }) => {
    const { body } = basePayload({ objetivoNota: "x".repeat(40_000) });
    const res = await post(request, body, "10.1.0.3");
    expect(res.status()).toBe(413);
  });

  test("formulário vazio é inválido (400)", async ({ request }) => {
    const res = await post(
      request,
      { consentimento: true, startedAt: Date.now() - 10_000, turnstileToken: "pass" },
      "10.1.0.4"
    );
    expect(res.status()).toBe(400);
  });

  test("e-mail inválido é rejeitado (400) e não envia e-mail", async ({ request }) => {
    const { empresa, body } = basePayload({ email: "isso-nao-e-email" });
    const res = await post(request, body, "10.1.0.5");
    expect(res.status()).toBe(400);
    expect(emailsFor(empresa)).toHaveLength(0);
  });

  test("URL inválida no campo site é rejeitada (400)", async ({ request }) => {
    const { body } = basePayload({ site: "não é uma url válida com espaços" });
    const res = await post(request, body, "10.1.0.11");
    expect(res.status()).toBe(400);
  });

  test("sem consentimento é rejeitado (400)", async ({ request }) => {
    const { body } = basePayload({ consentimento: false });
    const res = await post(request, body, "10.1.0.6");
    expect(res.status()).toBe(400);
  });

  test("objetivoPrincipal ausente → 400 (obrigatório, sem escape silencioso)", async ({ request }) => {
    const { body } = basePayload({ objetivoPrincipal: undefined });
    const res = await post(request, body, "10.3.0.1");
    expect(res.status()).toBe(400);
  });

  test("prazo ausente → 400 (obrigatório)", async ({ request }) => {
    const { body } = basePayload({ prazo: undefined });
    const res = await post(request, body, "10.3.0.2");
    expect(res.status()).toBe(400);
  });

  test("opção inválida em multiselect → 400 (validação de conjunto fechado)", async ({ request }) => {
    const { body } = basePayload({ canais: ["indicacao", "canal_que_nao_existe"] });
    const res = await post(request, body, "10.3.0.3");
    expect(res.status()).toBe(400);
  });

  test("marcou que tem Site mas não informou o link → 400 (regra de campo cruzado)", async ({ request }) => {
    const { empresa, body } = basePayload({ presenca: ["site"], site: "" });
    const res = await post(request, body, "10.3.0.4");
    expect(res.status()).toBe(400);
    expect(recordsFor(empresa)).toHaveLength(0);
  });

  test("marcou Instagram + informou o @ → 200", async ({ request }) => {
    const { empresa, body } = basePayload({ presenca: ["instagram"], instagram: "@minhaempresa" });
    const res = await post(request, body, "10.3.0.5");
    expect(res.status()).toBe(200);
    const [rec] = recordsFor(empresa);
    expect(rec.instagram).toBe("@minhaempresa");
  });

  test("Turnstile: token ausente → 403, sem persistir e sem e-mail", async ({ request }) => {
    const { empresa, body } = basePayload({ turnstileToken: undefined });
    const res = await post(request, body, "10.2.0.1");
    expect(res.status()).toBe(403);
    const j = await res.json();
    expect(j.ok).toBe(false);
    expect(recordsFor(empresa)).toHaveLength(0);
    expect(emailsFor(empresa)).toHaveLength(0);
    expect(JSON.stringify(j)).not.toMatch(/TURNSTILE|secret|siteverify|SUPABASE|RESEND/i);
  });

  test("Turnstile: token inválido → 403, sem persistir e sem e-mail", async ({ request }) => {
    const { empresa, body } = basePayload({ turnstileToken: "token-invalido-qualquer" });
    const res = await post(request, body, "10.2.0.2");
    expect(res.status()).toBe(403);
    expect((await res.json()).ok).toBe(false);
    expect(recordsFor(empresa)).toHaveLength(0);
    expect(emailsFor(empresa)).toHaveLength(0);
  });

  test("Turnstile é checado ANTES da validação Zod (body inválido + token ruim → 403, não 400)", async ({
    request,
  }) => {
    const { body } = basePayload({ turnstileToken: "xxx", nomeEmpresa: "", objetivoPrincipal: undefined });
    const res = await post(request, body, "10.2.0.4");
    expect(res.status()).toBe(403);
  });

  test("honeypot preenchido: ok, mas NÃO persiste e NÃO envia e-mail", async ({ request }) => {
    const { empresa, body } = basePayload({ website: "http://spam.example" });
    const res = await post(request, body, "10.1.0.7");
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(j.id).toBe("");
    expect(recordsFor(empresa)).toHaveLength(0);
    expect(emailsFor(empresa)).toHaveLength(0);
  });

  test("envio rápido demais: ok, mas NÃO persiste e NÃO envia e-mail", async ({ request }) => {
    const { empresa, body } = basePayload({ startedAt: Date.now() });
    const res = await post(request, body, "10.1.0.8");
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(j.id).toBe("");
    expect(recordsFor(empresa)).toHaveLength(0);
    expect(emailsFor(empresa)).toHaveLength(0);
  });

  test("submissão válida: persiste 1 registro e envia exatamente 1 e-mail (mock)", async ({ request }) => {
    const { empresa, body } = basePayload();
    const res = await post(request, body, "10.1.0.9");
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(j.id).toBeTruthy();
    expect(j.email).toBe("sent");

    expect(recordsFor(empresa)).toHaveLength(1);
    const mails = emailsFor(empresa);
    expect(mails).toHaveLength(1);
    expect(mails[0].to).toBe("qa-inbox@noryos.test"); // destinatário vem da env, não do form
    expect(String(mails[0].subject)).toBe(`Novo Diagnóstico Digital Noryos — ${empresa}`);

    expect(JSON.stringify(j)).not.toMatch(/x-forwarded-for|RESEND|SUPABASE|api key|stack/i);
  });

  test("duplo envio idêntico: 2º volta duplicate:true, MESMO id, 1 registro, 1 e-mail", async ({ request }) => {
    const { body } = basePayload({ nomeEmpresa: undefined });
    const nome = `TESTE NORYOS QA DUP ${Date.now()}`;
    const payload = { ...body, nomeEmpresa: nome };

    const first = await post(request, payload, "10.1.0.10");
    const second = await post(request, payload, "10.1.0.10");
    const b1 = await first.json();
    const b2 = await second.json();

    expect(b1.ok && b2.ok).toBe(true);
    expect(b2.duplicate).toBe(true);
    expect(b2.id).toBe(b1.id);
    expect(recordsFor(nome)).toHaveLength(1);
    expect(emailsFor(nome)).toHaveLength(1);
  });

  test("rate limit (janela curta): bloqueia após o limite e libera depois da janela", async ({ request }) => {
    const ip = "10.9.9.9";
    const codes: number[] = [];
    for (let i = 0; i < RL_SHORT_MAX + 1; i++) {
      const { body } = basePayload({ nomeEmpresa: `RL ${Date.now()}-${i}` });
      const res = await post(request, body, ip);
      codes.push(res.status());
    }
    expect(codes.slice(0, RL_SHORT_MAX).every((c) => c === 200)).toBe(true);
    expect(codes[RL_SHORT_MAX]).toBe(429);

    await new Promise((r) => setTimeout(r, RL_SHORT_WINDOW_MS + 800));
    const { body } = basePayload({ nomeEmpresa: `RL recuperado ${Date.now()}` });
    const again = await post(request, body, ip);
    expect(again.status()).toBe(200);
  });

  test("rate limit (janela longa): bloqueia acumulado mesmo após a janela curta resetar", async ({ request }) => {
    const ip = "10.9.5.5";
    const send = (i: number) => {
      const { body } = basePayload({ nomeEmpresa: `RL-LONG ${Date.now()}-${i}` });
      return post(request, body, ip);
    };

    for (let i = 0; i < RL_SHORT_MAX; i++) expect((await send(i)).status()).toBe(200);
    expect((await send(99)).status()).toBe(429); // curta

    await new Promise((r) => setTimeout(r, RL_SHORT_WINDOW_MS + 900));

    for (let i = 0; i < RL_LONG_MAX - RL_SHORT_MAX; i++) expect((await send(100 + i)).status()).toBe(200);

    expect((await send(200)).status()).toBe(429); // longa
  });
});

/**
 * Scoring V1 (inalterado) + respostas estruturadas V2 no pipeline.
 * O scoring roda ENTRE o dedupe e a persistência: só em request 100% válida,
 * numa única linha.
 */
test.describe("POST /api/diagnostico — scoring V1 + respostas V2 persistidos e notificados", () => {
  test("grava score/maturidade/classificacao/prioridade/scoring_version/resultado (v1) + form_version/respostas/prazo/objetivo_principal/porte (v2)", async ({
    request,
  }) => {
    const { empresa, body } = basePayload({
      presenca: ["instagram"],
      instagram: "@teste",
      canais: ["indicacao", "instagram_redes"],
      ferramentas: ["planilhas"],
      organizacao: "manual",
      dificuldadePrincipal: "atendimento_desorganizado",
      objetivoPrincipal: "mais_clientes",
      prazo: "o_quanto_antes",
      porte: "6_20",
    });
    const res = await post(request, body, "10.7.0.1");
    expect(res.status()).toBe(200);

    const [rec] = recordsFor(empresa);
    expect(rec).toBeTruthy();

    // --- scoring V1 (inalterado) ---
    expect(typeof rec.score).toBe("number");
    expect(rec.score as number).toBeGreaterThanOrEqual(0);
    expect(rec.score as number).toBeLessThanOrEqual(100);
    expect(typeof rec.maturidade_digital).toBe("number");
    expect(rec.scoring_version).toBe("v1");
    expect(String(rec.classificacao ?? "")).not.toBe("");
    expect(["baixa", "media", "alta", "critica"]).toContain(String(rec.prioridade ?? ""));
    const resultado = rec.resultado as Record<string, unknown>;
    expect(resultado.scoringVersion).toBe("v1");
    expect(resultado.potencialComercial).toBe(rec.score);
    expect(Array.isArray(resultado.gaps)).toBe(true);
    expect((resultado.servicosRecomendados as unknown[]).length).toBeLessThanOrEqual(3);

    // --- respostas estruturadas V2 (aditivas) ---
    expect(rec.form_version).toBe("v2");
    expect(rec.prazo).toBe("o_quanto_antes");
    expect(rec.objetivo_principal).toBe("mais_clientes");
    expect(rec.porte).toBe("6_20");
    const respostas = rec.respostas as Record<string, unknown>;
    expect(respostas).toBeTruthy();
    expect(respostas.canais).toEqual(["indicacao", "instagram_redes"]);
    expect(respostas.presenca).toEqual(["instagram"]);
    expect(respostas.organizacao).toBe("manual");
    expect(respostas.dificuldade_principal).toBe("atendimento_desorganizado");
    expect((respostas.links as Record<string, unknown>).instagram).toBe("@teste");

    // colunas legadas seguem sendo gravadas (backward compat de consultas)
    expect(String(rec.objetivo ?? "")).not.toBe("");
    expect(String(rec.dificuldade ?? "")).not.toBe("");
  });

  test("e-mail interno: resumo comercial no topo + bloco 'RESPOSTAS DO LEAD (ESTRUTURADO)'", async ({
    request,
  }) => {
    const { empresa, body } = basePayload({ porte: "6_20", canais: ["indicacao", "google_ads"] });
    const res = await post(request, body, "10.7.0.2");
    expect(res.status()).toBe(200);

    const [mail] = emailsFor(empresa);
    expect(mail).toBeTruthy();
    const preview = String(mail.textPreview ?? "");
    expect(preview).toContain("NOVO DIAGNÓSTICO DIGITAL");
    expect(preview).toMatch(/Potencial comercial: \d{1,3}\/100/);
    expect(preview).toContain("Scoring: v1");
    expect(preview).toContain("RESPOSTAS DO LEAD (ESTRUTURADO)");
    expect(preview).toContain("Prazo para começar:");
    expect(preview).toContain("Porte: 6–20 pessoas");
    expect(preview).toContain("DADOS ENVIADOS PELO LEAD");
  });

  test("subject só ganha emoji/realce em prioridade_comercial — lead comum fica neutro", async ({ request }) => {
    const { empresa, body } = basePayload();
    const res = await post(request, body, "10.7.0.3");
    expect(res.status()).toBe(200);

    const [mail] = emailsFor(empresa);
    expect(String(mail.subject)).toBe(`Novo Diagnóstico Digital Noryos — ${empresa}`);
    expect(String(mail.subject)).not.toContain("🔥");
  });

  test("duplicata NÃO repontua: 1 registro, scoring_version v1, form_version v2, mesmo id", async ({ request }) => {
    const { body } = basePayload({ nomeEmpresa: undefined });
    const nome = `TESTE NORYOS QA SCORE DUP ${Date.now()}`;
    const payload = { ...body, nomeEmpresa: nome };

    const first = await post(request, payload, "10.7.0.4");
    const second = await post(request, payload, "10.7.0.4");
    const b1 = await first.json();
    const b2 = await second.json();

    expect(b1.ok && b2.ok).toBe(true);
    expect(b2.duplicate).toBe(true);
    expect(b2.id).toBe(b1.id);

    const regs = recordsFor(nome);
    expect(regs).toHaveLength(1);
    expect(regs[0].scoring_version).toBe("v1");
    expect(regs[0].form_version).toBe("v2");
    expect(emailsFor(nome)).toHaveLength(1);
  });

  test("Turnstile inválido → 403 e o scoring nem chega a rodar (nada persistido, nada notificado)", async ({
    request,
  }) => {
    const { empresa, body } = basePayload({ turnstileToken: "token-invalido" });
    const res = await post(request, body, "10.7.0.5");
    expect(res.status()).toBe(403);
    expect(recordsFor(empresa)).toHaveLength(0);
    expect(emailsFor(empresa)).toHaveLength(0);
  });
});
