import { test, expect } from "@playwright/test";
import { watchConsole } from "./helpers";

test.describe("Noryos OS — workspace operacional", () => {
  test("troca a frente selecionada pelas tabs (desktop)", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/#noryos-os");

    await expect(page.locator("#noryos-os").getByText("NORYOS OS", { exact: true })).toBeVisible();
    const dk = page.locator("#noryos-os .osx-desktop");

    // estado inicial: "Presença Digital" em foco
    await expect(dk.getByRole("heading", { name: "Presença Digital" })).toBeVisible();
    await expect(dk.getByRole("tab", { name: /Presença Digital/ })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // clicar em outra frente troca o painel + o estado ativo
    await dk.getByRole("tab", { name: /Automações/ }).click();
    await expect(dk.getByRole("heading", { name: "Automações" })).toBeVisible();
    await expect(dk.getByRole("heading", { name: "Presença Digital" })).toHaveCount(0);
    await expect(dk.getByRole("tab", { name: /Automações/ })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(dk.getByRole("tab", { name: /Presença Digital/ })).toHaveAttribute(
      "aria-selected",
      "false"
    );

    // itens internos da frente aparecem
    await expect(dk.getByText("Fluxos", { exact: true })).toBeVisible();
    await expect(dk.getByText("Regras operacionais", { exact: true })).toBeVisible();

    console_.assertClean();
  });

  test("navegação por teclado entre as frentes (setas)", async ({ page }) => {
    await page.goto("/#noryos-os");
    const dk = page.locator("#noryos-os .osx-desktop");

    await dk.getByRole("tab", { name: /Presença Digital/ }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(dk.getByRole("tab", { name: /Aquisição/ })).toBeFocused();
    await expect(dk.getByRole("heading", { name: "Aquisição" })).toBeVisible();
    await page.keyboard.press("End");
    await expect(dk.getByRole("tab", { name: /Evolução/ })).toBeFocused();
    await expect(dk.getByRole("heading", { name: "Evolução" })).toBeVisible();
  });
});

test.describe("Noryos OS — accordion (mobile 390)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("abre/fecha frentes por toque, sem hover, sem overflow", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/#noryos-os");
    const mb = page.locator("#noryos-os .osx-mobile");
    // deixar o reveal ([data-anim="scale-in"]) da janela assentar antes de tocar
    await page.locator("#noryos-os .osx").scrollIntoViewIfNeeded();
    await expect(page.locator("#noryos-os .osx")).toHaveClass(/is-in/);

    // Presença Digital começa aberta
    await expect(
      mb.getByRole("button", { name: /Presença Digital/ })
    ).toHaveAttribute("aria-expanded", "true");
    await expect(mb.getByText("Estrutura do site", { exact: true })).toBeVisible();

    // abrir outra fecha a anterior
    const doc = mb.getByRole("button", { name: /Documentação/ });
    await doc.scrollIntoViewIfNeeded();
    await doc.click();
    await expect(doc).toHaveAttribute("aria-expanded", "true");
    await expect(mb.getByRole("button", { name: /Presença Digital/ })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    await expect(mb.getByText("Decisões", { exact: true })).toBeVisible();

    // tocar na frente já aberta recolhe (todas fechadas) — o painel colapsa a 0
    await doc.click();
    await expect(doc).toHaveAttribute("aria-expanded", "false");
    await expect(mb.locator(".osx-acc[data-open]")).toHaveCount(0);
    // depois da transição de 300ms o grid colapsa a 0px de verdade (sem vazar texto)
    await expect(mb.locator("#osx-acc-panel-5")).toHaveCSS("grid-template-rows", "0px");

    // reabrir Presença pra seguir a verificação de overflow
    await mb.getByRole("button", { name: /Presença Digital/ }).click();
    await expect(mb.getByText("Estrutura do site", { exact: true })).toBeVisible();

    // zero overflow horizontal na página (com motion ON — o bug antigo de ~4px)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, "sem scroll horizontal na Home no mobile (com motion)").toBeLessThanOrEqual(1);

    console_.assertClean();
  });
});

test.describe("Noryos OS — reduced-motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("troca de frente sem stagger nem deslize; conteúdo legível", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/#noryos-os");
    const dk = page.locator("#noryos-os .osx-desktop");

    await dk.getByRole("tab", { name: /Dados/ }).click();
    await expect(dk.getByRole("heading", { name: "Dados" })).toBeVisible();
    // itens visíveis imediatamente (sem delay de stagger)
    for (const it of ["Métricas acompanhadas", "Fontes conectadas", "Base pra decisão"]) {
      await expect(dk.getByText(it, { exact: true })).toBeVisible();
    }

    console_.assertClean();
  });
});

test.describe("FAQ — accordion", () => {
  test("abre e fecha um item", async ({ page }) => {
    await page.goto("/");

    const pergunta = page.getByRole("button", {
      name: /Já tenho um site\. A Noryos pode trabalhar/i,
    });
    await pergunta.scrollIntoViewIfNeeded();
    await expect(pergunta).toHaveAttribute("aria-expanded", "false");

    // o painel é um grid que colapsa via grid-template-rows: 0fr → 1fr
    const painel = pergunta.locator("xpath=following-sibling::div[1]");
    await expect(painel).toHaveCSS("grid-template-rows", "0px"); // fechado

    await pergunta.click();
    await expect(pergunta).toHaveAttribute("aria-expanded", "true");
    await expect(painel).not.toHaveCSS("grid-template-rows", "0px"); // aberto
    await expect(
      page.getByText(/Muitas vezes o problema não é refazer tudo do zero/i)
    ).toBeVisible();

    await pergunta.click();
    await expect(pergunta).toHaveAttribute("aria-expanded", "false");
    await expect(painel).toHaveCSS("grid-template-rows", "0px"); // fechou de novo
  });
});
