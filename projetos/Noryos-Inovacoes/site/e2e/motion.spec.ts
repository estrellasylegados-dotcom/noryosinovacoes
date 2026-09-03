import { test, expect } from "@playwright/test";
import { watchConsole, scrollThroughPage, expectContentRevealed } from "./helpers";

/**
 * Não valida estética — valida que o motion system NÃO esconde conteúdo e não
 * quebra JS. Regressão principal: o gatilho de reveal já disparou fora da
 * viewport e as seções ficavam "estáticas"/invisíveis.
 */
test.describe("Motion — conteúdo visível e sem erro de JS", () => {
  test("após rolar a Home, os blocos com data-anim ficam visíveis", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/");

    const total = await page.locator("[data-anim]").count();
    expect(total, "a Home usa o motion system").toBeGreaterThan(0);

    await scrollThroughPage(page);
    await expectContentRevealed(page, "(Home)");

    // âncora de conteúdo continua visível
    await expect(page.locator("#diagnostico")).toBeVisible();

    console_.assertClean();
  });

  test("interações-chave funcionam depois do scroll (FAQ + Noryos OS)", async ({ page }) => {
    await page.goto("/");
    await scrollThroughPage(page);

    // trazer o alvo pra viewport e esperar o reveal ([data-anim]) assentar
    // antes de clicar — senão, sob carga, o clique disputa com a transição
    // ("element is not stable").
    const faqBtn = page.getByRole("button", { name: /Preciso contratar todas as soluções/i });
    await faqBtn.scrollIntoViewIfNeeded();
    await expect(faqBtn).toBeVisible();
    await faqBtn.click();
    await expect(faqBtn).toHaveAttribute("aria-expanded", "true");

    const dk = page.locator("#noryos-os .osx-desktop");
    await dk.scrollIntoViewIfNeeded();
    const autoTab = dk.getByRole("tab", { name: /Automações/ });
    await expect(autoTab).toBeVisible();
    await autoTab.click();
    await expect(dk.getByRole("heading", { name: "Automações" })).toBeVisible();
  });
});
