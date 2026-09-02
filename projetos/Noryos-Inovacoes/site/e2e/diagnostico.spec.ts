import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { watchConsole, attachTurnstileToken } from "./helpers";

/**
 * Fluxo do formulário do Diagnóstico Digital — Form V2 (5 etapas, chips
 * multiselect + cards de seleção única, links condicionais, objetivo/prazo
 * obrigatórios).
 *
 * A maioria dos casos vai só até o botão de envio (sem enviar). Os casos
 * "envia o formulário" fazem POST real contra /api/diagnostico. O servidor
 * sob teste (playwright.config.ts → webServer.env) usa e-mail `mock` e
 * fallback local de persistência. Cada teste de envio manda um
 * X-Forwarded-For próprio (bucket de rate limit isolado). O honeypot nunca é
 * tocado. Campos buscados DENTRO do <form> (fora dele existe o botão
 * flutuante de WhatsApp).
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

async function preencherEtapa1(page: Page, empresa = "Empresa Teste E2E") {
  await form(page).getByLabel("Nome da empresa").fill(empresa);
  await form(page).getByLabel("Seu nome").fill("Fulano de Teste");
  await form(page).getByLabel("WhatsApp").fill("11999998888");
}

const continuar = (page: Page) => page.getByRole("button", { name: "Continuar" }).click();

/** Etapa 1 → 5, escolhendo objetivo + prazo + consentimento, pronta pra enviar. */
async function preencherTudo(page: Page, empresa: string) {
  await preencherEtapa1(page, empresa);
  await form(page).getByLabel("E-mail").fill("qa+e2e@example.com");
  await continuar(page); // → 2
  await continuar(page); // → 3
  await continuar(page); // → 4
  await continuar(page); // → 5
  await expect(page.getByText("Etapa 5 de 5")).toBeVisible();
  await form(page).getByRole("radio", { name: "Conseguir mais clientes" }).check();
  await form(page).getByRole("radio", { name: "Nos próximos 90 dias" }).check();
  await form(page).getByRole("checkbox").check(); // consentimento (único checkbox na etapa 5)
  // O endpoint descarta submissões abaixo de MIN_FILL_TIME_MS (2500 ms desde a
  // montagem do form). O Playwright preenche rápido demais — simula o humano.
  await page.waitForTimeout(3000);
}

test.describe("Diagnóstico Digital — Form V2", () => {
  test("renderiza a página e a etapa 1", async ({ page }) => {
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
    await expect(page.locator('input[name="website"]')).toBeHidden();

    console_.assertClean();
  });

  test("bloqueia o avanço da etapa 1 com os obrigatórios vazios", async ({ page }) => {
    await page.goto("/diagnostico");
    await continuar(page);
    // validação nativa do HTML5 barra o submit e foca o 1º campo obrigatório
    await expect(page.getByText("Etapa 1 de 5")).toBeVisible();
    await expect(page.getByText("Etapa 2 de 5")).toHaveCount(0);
    await expect(form(page).getByLabel("Nome da empresa")).toBeFocused();
    await expect(form(page).getByLabel("Nome da empresa")).toHaveJSProperty("validity.valid", false);
  });

  test("percorre as 5 etapas usando chips e cards", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/diagnostico");

    // Etapa 1
    await preencherEtapa1(page);
    await form(page).getByRole("radio", { name: "2–5 pessoas" }).check();
    await continuar(page);
    await expect(page.getByText("Etapa 2 de 5")).toBeVisible();

    // Etapa 2 — multiselect + link condicional
    await form(page).getByRole("checkbox", { name: "Instagram", exact: true }).check();
    await expect(form(page).getByLabel(/@ ou link do Instagram/i)).toBeVisible();
    await form(page).getByLabel(/@ ou link do Instagram/i).fill("@minhaempresa");
    await continuar(page);
    await expect(page.getByText("Etapa 3 de 5")).toBeVisible();

    // Etapa 3 — canais + "Outro"
    await form(page).getByRole("checkbox", { name: "Indicação / boca a boca" }).check();
    await form(page).getByRole("checkbox", { name: "Outro" }).check();
    await expect(form(page).getByLabel("Qual outro canal?")).toBeVisible();
    await form(page).getByLabel("Qual outro canal?").fill("Eventos e feiras");
    await continuar(page);
    await expect(page.getByText("Etapa 4 de 5")).toBeVisible();

    // Etapa 4 — ferramentas + organização + dificuldade
    await form(page).getByRole("checkbox", { name: "Planilhas" }).check();
    await form(page).getByRole("radio", { name: "Funciona, mas ainda é bem manual" }).check();
    await form(page).getByRole("radio", { name: "Atendimento desorganizado" }).check();
    await continuar(page);
    await expect(page.getByText("Etapa 5 de 5")).toBeVisible();

    // Etapa 5 — objetivo + prazo obrigatórios + consentimento
    const enviar = page.getByRole("button", { name: "Solicitar meu diagnóstico" });
    await enviar.click();
    await expect(form(page).getByRole("alert")).toContainText(/objetivo/i);
    await expect(page.getByText("Etapa 5 de 5")).toBeVisible();

    await form(page).getByRole("radio", { name: "Automatizar atendimento / processos" }).check();
    await form(page).getByRole("radio", { name: "Nos próximos 30 dias" }).check();
    await enviar.click();
    await expect(form(page).getByRole("alert")).toContainText(/aceitar o contato/i);

    await form(page).getByRole("checkbox").check(); // consentimento
    await expect(form(page).getByRole("checkbox")).toBeChecked();
    await expect(enviar).toBeEnabled();

    await expect(form(page).getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute(
      "href",
      "/politica-de-privacidade"
    );

    console_.assertClean();
  });

  test("marcou Site mas não informou o link → não avança da etapa 2", async ({ page }) => {
    await page.goto("/diagnostico");
    await preencherEtapa1(page);
    await continuar(page);
    await expect(page.getByText("Etapa 2 de 5")).toBeVisible();

    await form(page).getByRole("checkbox", { name: "Site", exact: true }).check();
    await expect(form(page).getByLabel("Endereço do site")).toBeVisible();
    await continuar(page);
    // o campo de link revelado é obrigatório (regra de campo cruzado): não avança
    await expect(page.getByText("Etapa 2 de 5")).toBeVisible();
    await expect(page.getByText("Etapa 3 de 5")).toHaveCount(0);
    await expect(form(page).getByLabel("Endereço do site")).toHaveJSProperty("validity.valid", false);

    await form(page).getByLabel("Endereço do site").fill("minhaempresa.com.br");
    await continuar(page);
    await expect(page.getByText("Etapa 3 de 5")).toBeVisible();
  });

  test("Voltar preserva texto, chips e cards", async ({ page }) => {
    await page.goto("/diagnostico");
    await preencherEtapa1(page, "Empresa Memória E2E");
    await continuar(page);

    await form(page).getByRole("checkbox", { name: "Instagram", exact: true }).check();
    await form(page).getByLabel(/@ ou link do Instagram/i).fill("@lembrar");
    await continuar(page); // → 3
    await form(page).getByRole("checkbox", { name: "Indicação / boca a boca" }).check();

    // volta até a etapa 1 e avança de novo
    await page.getByRole("button", { name: "Voltar" }).click(); // → 2
    await expect(form(page).getByRole("checkbox", { name: "Instagram", exact: true })).toBeChecked();
    await expect(form(page).getByLabel(/@ ou link do Instagram/i)).toHaveValue("@lembrar");
    await page.getByRole("button", { name: "Voltar" }).click(); // → 1
    await expect(form(page).getByLabel("Nome da empresa")).toHaveValue("Empresa Memória E2E");

    await continuar(page); // → 2
    await continuar(page); // → 3
    await expect(form(page).getByRole("checkbox", { name: "Indicação / boca a boca" })).toBeChecked();
  });

  test("envia o formulário: loading, sucesso, 1 registro V2 e 1 e-mail", async ({ page }) => {
    const console_ = watchConsole(page);
    const empresa = `TESTE NORYOS QA E2E ${Date.now()}`;
    await page.setExtraHTTPHeaders({ "x-forwarded-for": "198.51.100.31" });
    await attachTurnstileToken(page, { delayMs: 800 });

    await page.goto("/diagnostico");
    await preencherTudo(page, empresa);

    const enviar = page.getByRole("button", { name: "Solicitar meu diagnóstico" });
    const responsePromise = page.waitForResponse(
      (r) => r.url().includes("/api/diagnostico") && r.request().method() === "POST"
    );
    await enviar.click();

    await expect(page.getByRole("button", { name: "Enviando..." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Enviando..." })).toBeDisabled();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.id).toBeTruthy();
    expect(body.email).toBe("sent");

    await expect(page.getByText("Diagnóstico recebido.")).toBeVisible();

    const registros = recordsFor(empresa);
    expect(registros).toHaveLength(1);
    expect(registros[0].id).toBe(body.id);
    expect(registros[0].form_version).toBe("v2");
    expect(registros[0].objetivo_principal).toBe("mais_clientes");
    expect(registros[0].prazo).toBe("ate_90_dias");
    expect((registros[0].respostas as Record<string, unknown>)).toBeTruthy();

    expect(emailsFor(empresa)).toHaveLength(1);

    console_.assertClean();
  });

  test("duplo clique no envio não gera segundo registro nem segundo e-mail", async ({ page }) => {
    const empresa = `TESTE NORYOS QA DUP-E2E ${Date.now()}`;
    await page.setExtraHTTPHeaders({ "x-forwarded-for": "198.51.100.32" });
    await attachTurnstileToken(page);

    await page.goto("/diagnostico");
    await preencherTudo(page, empresa);

    await page.getByRole("button", { name: "Solicitar meu diagnóstico" }).dblclick();

    await expect(page.getByText("Diagnóstico recebido.")).toBeVisible();
    await page.waitForTimeout(600);

    expect(recordsFor(empresa)).toHaveLength(1);
    expect(emailsFor(empresa)).toHaveLength(1);
  });
});

test.describe("Diagnóstico Digital — mobile 390px", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("fluxo completo no mobile: sem scroll horizontal, sucesso, 1 registro", async ({ page }) => {
    const console_ = watchConsole(page);
    const empresa = `TESTE NORYOS QA MOBILE ${Date.now()}`;
    await page.setExtraHTTPHeaders({ "x-forwarded-for": "198.51.100.33" });
    await attachTurnstileToken(page);

    await page.goto("/diagnostico");

    const noHScroll = () =>
      page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
    expect(await noHScroll()).toBe(true);

    await preencherTudo(page, empresa);
    expect(await noHScroll()).toBe(true);

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
