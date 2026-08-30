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

    const faqBtn = page.getByRole("button", { name: /Preciso contratar todas as soluções/i });
    await faqBtn.click();
    await expect(faqBtn).toHaveAttribute("aria-expanded", "true");

    const os = page.locator("#noryos-os");
    await os.getByRole("button", { name: "Automações" }).click();
    await expect(os.getByRole("heading", { name: "Automações" })).toBeVisible();
  });
});
