import { test, expect } from "@playwright/test";
import { watchConsole, watchFailedAssets } from "./helpers";

test.describe("Home", () => {
  test("abre, renderiza o essencial e não gera erro de JS nem 404 de asset", async ({ page }) => {
    const console_ = watchConsole(page);
    const assets = watchFailedAssets(page);

    const response = await page.goto("/");
    expect(response?.status(), "GET / deve responder 200").toBe(200);

    // Header presente
    const header = page.locator("header.site-header");
    await expect(header).toBeVisible();

    // Logo: link pra home + imagem carregada de fato (naturalWidth > 0)
    const logoLink = header.getByRole("link", { name: /Noryos Inovações — página inicial/i });
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toHaveAttribute("href", "/");
    const logoImg = logoLink.locator("img");
    await expect(logoImg).toBeVisible();
    const naturalWidth = await logoImg.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(naturalWidth, "a imagem da logo deve ter carregado").toBeGreaterThan(0);

    // H1 do hero
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/crescimento/i);

    // CTA principal do hero
    await expect(
      page.getByRole("link", { name: "Conversar sobre meu projeto" }).first()
    ).toBeVisible();

    // JSON-LD Organization + WebSite no HTML
    const ldCount = await page.locator('script[type="application/ld+json"]').count();
    expect(ldCount, "deve haver structured data (Organization + WebSite)").toBeGreaterThanOrEqual(2);

    assets.assertClean();
    console_.assertClean();
  });

  test("as âncoras de seção da Home existem no DOM", async ({ page }) => {
    await page.goto("/");
    for (const id of ["solucoes", "noryos-os", "diagnostico", "processo"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });
});
