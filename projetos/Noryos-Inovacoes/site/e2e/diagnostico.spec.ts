import { test, expect, type Page } from "@playwright/test";
import { watchConsole } from "./helpers";

/**
 * O formulário NÃO é enviado de verdade em nenhum teste — evita lead falso /
 * spam e qualquer ação externa. A cobertura vai até o último passo com o
 * botão de envio habilitado. O honeypot (`input[name="website"]`) nunca é
 * tocado. Um envio real ponta a ponta é checagem manual/integração (exige
 * Supabase configurado + limpeza do registro).
 *
 * Os campos são buscados DENTRO do <form> — fora dele existe o botão
 * flutuante de WhatsApp, cujo aria-label colide com o label "WhatsApp".
 */
function form(page: Page) {
  return page.locator("form");
}

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
});
