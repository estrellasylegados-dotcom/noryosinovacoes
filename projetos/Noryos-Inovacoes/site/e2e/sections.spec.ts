import { test, expect } from "@playwright/test";
import { watchConsole } from "./helpers";

test.describe("Noryos OS — explorer interativo", () => {
  test("troca a categoria selecionada ao clicar na árvore", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/#noryos-os");

    const section = page.locator("#noryos-os");
    await expect(section).toBeVisible();
    await expect(section.getByText("NORYOS OS", { exact: true })).toBeVisible();

    // estado inicial: "Presença Digital" é a categoria ativa (h3 do painel)
    await expect(section.getByRole("heading", { name: "Presença Digital" })).toBeVisible();

    // clicar em outra categoria da árvore troca o painel contextual
    await section.getByRole("button", { name: "Aquisição" }).click();
    await expect(section.getByRole("heading", { name: "Aquisição" })).toBeVisible();
    await expect(section.getByRole("heading", { name: "Presença Digital" })).toHaveCount(0);

    // o item da árvore fica marcado como selecionado
    const selecionado = section.locator('li[data-selected="true"]');
    await expect(selecionado).toContainText("Aquisição");

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
