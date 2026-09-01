import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { watchConsole } from "./helpers";

/**
 * A maior parte dos casos vai só até o botão de envio habilitado (sem
 * enviar), pra não gerar ruído. Os casos "envia o formulário" fazem um POST
 * real contra /api/diagnostico. O servidor sob teste (ver
 * playwright.config.ts → webServer.env) usa provedor de e-mail `mock` (grava
 * em .data/diagnostico.email-mock.jsonl, nada de e-mail real) e fallback
 * local de persistência. Cada teste de envio manda um X-Forwarded-For
 * próprio pra ter bucket de rate limit isolado. O honeypot nunca é tocado.
 *
 * Os campos são buscados DENTRO do <form> — fora dele existe o botão
 * flutuante de WhatsApp, cujo aria-label colide com o label "WhatsApp".
 */
function form(page: Page) {
  return page.locator("form");
}

const LOCAL_STORE = path.join(process.cwd(), ".data", "diagnostico.local.jsonl");
const EMAIL_MOCK = path.join(process.cwd(), ".data", "diagnostico.email-mock.jsonl");

function readJsonl(file: string): Array<Record<string, unknown>> {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
}
const recordsFor = (empresa: string) => readJsonl(LOCAL_STORE).filter((r) => r.nome_empresa === empresa);
const emailsFor = (empresa: string) =>
  readJsonl(EMAIL_MOCK).filter((e) => String(e.subject ?? "").includes(empresa));

async function preencherPasso1(page: Page) {
  await form(page).getByLabel("Nome da empresa").fill("Empresa Teste E2E");
  await form(page).getByLabel("Seu nome").fill("Fulano de Teste");
  await form(page).getByLabel("WhatsApp").fill("11999998888");
}

test.describe("Diagnóstico Digital", () => {
  test("renderiza a página e o formulário no passo 1", async ({ page }) => {
    const console_ = watchConsole(page);
    const res = await page.goto("/diagnostico");
    expect(res?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Descubra onde sua operação digital pode melhorar/i
    );
    await expect(page.getByText("Etapa 1 de 5")).toBeVisible();
    await expect(form(page).getByLabel("Nome da empresa")).toBeVisible();
    await expect(form(page).getByLabel("Seu nome")).toBeVisible();
    await expect(form(page).getByLabel("WhatsApp")).toBeVisible();

    // honeypot presente mas fora do fluxo visível
    await expect(page.locator('input[name="website"]')).toBeHidden();

    console_.assertClean();
  });

  test("bloqueia o avanço com os campos obrigatórios vazios", async ({ page }) => {
    await page.goto("/diagnostico");
    await page.getByRole("button", { name: "Continuar" }).click();
    // continua no passo 1 — nada de avançar sem os obrigatórios
    await expect(page.getByText("Etapa 1 de 5")).toBeVisible();
    await expect(page.getByText("Etapa 2 de 5")).toHaveCount(0);
  });

  test("preenche e percorre os 5 passos até o botão de envio", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/diagnostico");

    // Passo 1 — obrigatórios
    await preencherPasso1(page);
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByText("Etapa 2 de 5")).toBeVisible();

    // Passo 2 — presença digital (opcional)
    await form(page).getByLabel("Site atual (se tiver)").fill("exemplo.com.br");
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByText("Etapa 3 de 5")).toBeVisible();

    // Passo 3 — aquisição (opcional)
    await form(page)
      .getByLabel(/Como sua empresa consegue clientes hoje/i)
      .fill("Indicação e Instagram.");
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByText("Etapa 4 de 5")).toBeVisible();

    // Passo 4 — atendimento (opcional)
    await form(page)
      .getByLabel(/maior dificuldade com atendimento/i)
      .fill("Responder rápido no WhatsApp.");
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByText("Etapa 5 de 5")).toBeVisible();

    // Passo 5 — objetivos + consentimento LGPD (obrigatório)
    const consent = form(page).getByRole("checkbox");
    await expect(consent).not.toBeChecked();

    // sem consentimento não envia — o botão de envio continua na tela
    const enviar = page.getByRole("button", { name: "Solicitar meu diagnóstico" });
    await expect(enviar).toBeVisible();
    await enviar.click();
    await expect(page.getByText("Etapa 5 de 5")).toBeVisible();
    await expect(page.getByText("Diagnóstico recebido.")).toHaveCount(0);

    // com consentimento, o botão fica pronto pra envio (não clicamos)
    await consent.check();
    await expect(consent).toBeChecked();
    await expect(enviar).toBeEnabled();

    // link da Política de Privacidade funciona
    await expect(form(page).getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute(
      "href",
      "/politica-de-privacidade"
    );

    console_.assertClean();
  });

  test("dá pra voltar um passo sem perder o que foi digitado", async ({ page }) => {
    await page.goto("/diagnostico");
    await preencherPasso1(page);
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByText("Etapa 2 de 5")).toBeVisible();

    await page.getByRole("button", { name: "Voltar" }).click();
    await expect(page.getByText("Etapa 1 de 5")).toBeVisible();
    await expect(form(page).getByLabel("Nome da empresa")).toHaveValue("Empresa Teste E2E");
  });

  /** Preenche as 5 etapas com dados de teste e para no passo 5 com consentimento marcado. */
  async function preencherTudo(page: Page, empresa: string) {
    await form(page).getByLabel("Nome da empresa").fill(empresa);
    await form(page).getByLabel("Seu nome").fill("Rafael Teste");
    await form(page).getByLabel("WhatsApp").fill("11999998888");
    await form(page).getByLabel("E-mail").fill("qa+e2e@example.com");
    await page.getByRole("button", { name: "Continuar" }).click();
    await form(page).getByLabel("Site atual (se tiver)").fill("exemplo.com.br");
    await page.getByRole("button", { name: "Continuar" }).click();
    await form(page).getByLabel(/Como sua empresa consegue clientes hoje/i).fill("Indicação.");
    await page.getByRole("button", { name: "Continuar" }).click();
    await form(page).getByLabel(/maior dificuldade com atendimento/i).fill("Responder rápido no WhatsApp.");
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByText("Etapa 5 de 5")).toBeVisible();
    await form(page).getByRole("checkbox").check();
    // O endpoint descarta submissões abaixo de MIN_FILL_TIME_MS (2500ms desde a
    // montagem do form) como bot. O Playwright preenche rápido demais — esta
    // espera simula o tempo de um humano.
    await page.waitForTimeout(3000);
  }

  test("envia o formulário: loading, sucesso, 1 registro e 1 e-mail", async ({ page }) => {
    const console_ = watchConsole(page);
    const empresa = `TESTE NORYOS QA E2E ${Date.now()}`;
    await page.setExtraHTTPHeaders({ "x-forwarded-for": "198.51.100.21" });

    // Atrasa a resposta da API pra o estado de loading ser observável de forma
    // determinística (o servidor local responde rápido demais).
    await page.route("**/api/diagnostico", async (route) => {
      await new Promise((r) => setTimeout(r, 800));
      await route.continue();
    });

    await page.goto("/diagnostico");
    await preencherTudo(page, empresa);

    const enviar = page.getByRole("button", { name: "Solicitar meu diagnóstico" });
    const responsePromise = page.waitForResponse(
      (r) => r.url().includes("/api/diagnostico") && r.request().method() === "POST"
    );
    await enviar.click();

    // estado de loading enquanto a requisição está em voo
    await expect(page.getByRole("button", { name: "Enviando..." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Enviando..." })).toBeDisabled();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.id).toBeTruthy();
    expect(body.email).toBe("sent"); // provedor mock no ambiente de teste

    await expect(page.getByText("Diagnóstico recebido.")).toBeVisible();

    const registros = recordsFor(empresa);
    expect(registros).toHaveLength(1);
    expect(registros[0].id).toBe(body.id);
    expect(registros[0].responsavel).toBe("Rafael Teste");

    const mails = emailsFor(empresa);
    expect(mails).toHaveLength(1);
    expect(mails[0].to).toBe("qa-inbox@noryos.test");

    console_.assertClean();
  });

  test("duplo clique no envio não gera segundo registro nem segundo e-mail", async ({ page }) => {
    const empresa = `TESTE NORYOS QA DUP-E2E ${Date.now()}`;
    await page.setExtraHTTPHeaders({ "x-forwarded-for": "198.51.100.22" });

    await page.goto("/diagnostico");
    await preencherTudo(page, empresa);

    // Dois cliques em sequência imediata, antes do React desabilitar o botão.
    // A trava `inFlight` no componente + o dedupe no endpoint garantem um só.
    await page.getByRole("button", { name: "Solicitar meu diagnóstico" }).dblclick();

    await expect(page.getByText("Diagnóstico recebido.")).toBeVisible();
    await page.waitForTimeout(600); // deixa um eventual 2º POST chegar

    expect(recordsFor(empresa)).toHaveLength(1);
    expect(emailsFor(empresa)).toHaveLength(1);
  });
});

test.describe("Diagnóstico Digital — mobile 390px", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("fluxo principal completo no mobile: sem scroll horizontal, sucesso, 1 registro", async ({ page }) => {
    const console_ = watchConsole(page);
    const empresa = `TESTE NORYOS QA MOBILE ${Date.now()}`;
    await page.setExtraHTTPHeaders({ "x-forwarded-for": "198.51.100.23" });

    await page.goto("/diagnostico");

    const noHScroll = () =>
      page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
    expect(await noHScroll()).toBe(true);

    await form(page).getByLabel("Nome da empresa").fill(empresa);
    await form(page).getByLabel("Seu nome").fill("Rafael Teste");
    await form(page).getByLabel("WhatsApp").fill("11999998888");
    await page.getByRole("button", { name: "Continuar" }).click();
    for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByText("Etapa 5 de 5")).toBeVisible();
    await form(page).getByRole("checkbox").check();
    await page.waitForTimeout(3000);

    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/diagnostico") && r.request().method() === "POST"),
      page.getByRole("button", { name: "Solicitar meu diagnóstico" }).click(),
    ]);
    expect(response.status()).toBe(200);
    expect((await response.json()).ok).toBe(true);

    await expect(page.getByText("Diagnóstico recebido.")).toBeVisible();
    expect(await noHScroll()).toBe(true);
    expect(recordsFor(empresa)).toHaveLength(1);
    expect(emailsFor(empresa)).toHaveLength(1);

    console_.assertClean();
  });
});
