import { test, expect } from "@playwright/test";
import { watchConsole, scrollThroughPage } from "./helpers";

test.describe("Header e navegação — desktop", () => {
  test("os links do menu levam às páginas certas", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(nav).toBeVisible();

    // 5 itens de navegação (src/content/navegacao.ts → navegacaoHeader)
    await expect(nav.getByRole("link")).toHaveCount(5);

    await nav.getByRole("link", { name: "Diagnóstico" }).click();
    await expect(page).toHaveURL(/\/diagnostico$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.goto("/");
    await page.getByRole("navigation", { name: "Navegação principal" })
      .getByRole("link", { name: "Soluções" })
      .click();
    await expect(page).toHaveURL(/\/solucoes$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Soluções para diferentes etapas/i);
  });

  test("o CTA do header aponta pra um destino válido (WhatsApp ou fallback de e-mail)", async ({ page }) => {
    await page.goto("/");
    const cta = page
      .locator("header.site-header")
      .getByRole("link", { name: "Conversar", exact: true });
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute("href");
    expect(href, "CTA nunca pode ficar sem href").toBeTruthy();
    expect(href!).toMatch(/^(https:\/\/wa\.me\/|mailto:)/);
  });
});

test.describe("Header e navegação — mobile 390px", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("o menu mobile abre, navega e não deixa erro no console", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/");

    const toggle = page.getByRole("button", { name: "Abrir menu" });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await expect(page.getByRole("button", { name: "Fechar menu" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );

    // painel mobile (dentro do <header>): link "Sobre" navega
    await page
      .locator("header.site-header")
      .getByRole("link", { name: "Sobre", exact: true })
      .click();
    await expect(page).toHaveURL(/\/sobre$/);

    console_.assertClean();
  });

  // reduced-motion zera o transform inicial de `[data-anim]` (translateX 28px),
  // então o que sobrar de overflow é layout de verdade, não reveal em voo.
  test("a Home não tem scroll horizontal no mobile", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await scrollThroughPage(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, "não pode haver overflow horizontal").toBeLessThanOrEqual(1);
  });
});
