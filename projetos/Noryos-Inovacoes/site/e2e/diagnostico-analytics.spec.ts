import { test, expect, type Page } from "@playwright/test";
import { attachTurnstileToken } from "./helpers";

/**
 * Funil do Diagnóstico — eventos de analytics (sem PII).
 *
 * Sem GTM/GA configurado, `src/lib/analytics.ts` ainda popula
 * `window.dataLayer` com `{ event, ...params }`. A suíte inspeciona esse
 * array: o funil precisa emitir os eventos-chave e NUNCA carregar PII
 * (nome, e-mail, telefone, empresa, texto livre, URLs).
 *
 * `turnstile_concluido` dispara no callback do widget do Turnstile, que NÃO
 * é renderizado no build de teste (sem NEXT_PUBLIC_TURNSTILE_SITE_KEY) — é
 * validado no teste real em produção.
 */

type DlEntry = Record<string, unknown>;
const dl = (page: Page) => page.evaluate(() => (window as unknown as { dataLayer?: DlEntry[] }).dataLayer ?? []);
const eventos = (entries: DlEntry[]) => entries.map((e) => e.event);
const form = (page: Page) => page.locator("form");
const continuar = (page: Page) => page.getByRole("button", { name: "Continuar" }).click();

test("emite iniciar/visualizar/avançar/voltar/erro/enviar/sucesso, sem PII", async ({ page }) => {
  const EMPRESA = `PII-EMPRESA-${Date.now()}`;
  const WHATSAPP = "11987650000";
  const EMAIL = "pii-lead@example.com";
  const TEXTO_LIVRE = "PII-TEXTO-LIVRE-marcador";

  await page.setExtraHTTPHeaders({ "x-forwarded-for": "198.51.100.44" });
  await attachTurnstileToken(page);
  await page.goto("/diagnostico");

  // Início + visualização da etapa 1
  await expect.poll(async () => eventos(await dl(page))).toEqual(
    expect.arrayContaining(["iniciar_diagnostico", "visualizar_etapa"])
  );
  {
    const entries = await dl(page);
    const view1 = entries.find((e) => e.event === "visualizar_etapa");
    expect(view1?.etapa).toBe(1);
  }

  // Etapa 1 → 2  (avançar + visualizar)
  await form(page).getByLabel("Nome da empresa").fill(EMPRESA);
  await form(page).getByLabel("Seu nome").fill("Fulano PII");
  await form(page).getByLabel("WhatsApp").fill(WHATSAPP);
  await form(page).getByLabel("E-mail").fill(EMAIL);
  await continuar(page);
  await expect(page.getByText("Etapa 2 de 5")).toBeVisible();
  await expect.poll(async () => eventos(await dl(page))).toEqual(
    expect.arrayContaining(["avancar_etapa"])
  );
  {
    const entries = await dl(page);
    const avancar = entries.find((e) => e.event === "avancar_etapa");
    expect(avancar).toMatchObject({ de: 1, para: 2 });
  }

  // Voltar 2 → 1
  await page.getByRole("button", { name: "Voltar" }).click();
  await expect(page.getByText("Etapa 1 de 5")).toBeVisible();
  {
    const entries = await dl(page);
    const voltar = entries.find((e) => e.event === "voltar_etapa");
    expect(voltar).toMatchObject({ de: 2, para: 1 });
  }

  // Vai até a etapa 5 e dispara erro de validação (sem objetivo/prazo)
  await continuar(page);
  await continuar(page);
  await continuar(page);
  await continuar(page);
  await expect(page.getByText("Etapa 5 de 5")).toBeVisible();

  // "Outro" com texto livre marcador — não pode vazar pro dataLayer
  await form(page).getByRole("radio", { name: "Outro" }).check();
  await form(page).getByLabel("Qual outro objetivo?").fill(TEXTO_LIVRE);

  await page.getByRole("button", { name: "Solicitar meu diagnóstico" }).click();
  await expect.poll(async () => eventos(await dl(page))).toEqual(
    expect.arrayContaining(["erro_validacao_etapa"])
  );
  {
    const entries = await dl(page);
    const erro = entries.find((e) => e.event === "erro_validacao_etapa");
    expect(erro?.etapa).toBe(5);
  }

  // Preenche o mínimo e envia
  await form(page).getByRole("radio", { name: "Conseguir mais clientes" }).check();
  await form(page).getByRole("radio", { name: "O quanto antes" }).check();
  await form(page).getByRole("checkbox").check();
  await page.waitForTimeout(3000);

  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/diagnostico") && r.request().method() === "POST"),
    page.getByRole("button", { name: "Solicitar meu diagnóstico" }).click(),
  ]);
  expect(response.status()).toBe(200);
  await expect(page.getByText("Diagnóstico recebido.")).toBeVisible();

  await expect.poll(async () => eventos(await dl(page))).toEqual(
    expect.arrayContaining(["enviar_diagnostico", "diagnostico_enviado_com_sucesso"])
  );
  {
    const entries = await dl(page);
    const enviar = entries.find((e) => e.event === "enviar_diagnostico");
    expect(enviar?.etapa).toBe(5);
  }

  // --- SEM PII em nenhum evento ---
  const blob = JSON.stringify(await dl(page));
  for (const segredo of [EMPRESA, WHATSAPP, EMAIL, TEXTO_LIVRE, "Fulano PII"]) {
    expect(blob).not.toContain(segredo);
  }
  // só chaves seguras: event + numéricos/flags de etapa/status
  for (const entry of await dl(page)) {
    for (const [k, v] of Object.entries(entry)) {
      if (k === "event" || k.startsWith("gtm.")) continue;
      expect(["number", "boolean"]).toContain(typeof v);
    }
  }
});
