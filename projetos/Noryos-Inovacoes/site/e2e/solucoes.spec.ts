import { test, expect, type Locator } from "@playwright/test";
import { watchConsole, scrollThroughPage, expectContentRevealed } from "./helpers";

/**
 * Página comercial /solucoes. Valida comportamento (não estética):
 * - hero tem CTA primário para conversa (WhatsApp ou fallback de e-mail);
 * - os CTAs das 3 portas usam mensagem de WhatsApp contextual por origem
 *   (quando o número está configurado no build);
 * - tabs de segmento trocam o conteúdo;
 * - FAQ abre e fecha;
 * - sem erro de JS, sem overflow horizontal, reduced-motion não apaga a página.
 */

/** href de um CTA + texto pré-preenchido decodificado (quando wa.me). */
async function ctaTarget(link: Locator) {
  const href = (await link.getAttribute("href")) ?? "";
  expect(href, "CTA nunca pode ficar sem href").toBeTruthy();
  expect(href).toMatch(/^(https:\/\/wa\.me\/|mailto:)/);
  const isWa = href.startsWith("https://wa.me/");
  const text = isWa ? decodeURIComponent(new URL(href).searchParams.get("text") ?? "") : "";
  return { href, isWa, text };
}

test.describe("/solucoes — página comercial", () => {
  test("hero: título novo + CTA primário para conversa", async ({ page }) => {
    const console_ = watchConsole(page);
    const res = await page.goto("/solucoes");
    expect(res?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Estrutura digital/i);

    const cta = page.getByRole("link", { name: "Conversar sobre minha empresa" }).first();
    await expect(cta).toBeVisible();
    const { isWa, text } = await ctaTarget(cta);
    if (isWa) expect(text.toLowerCase()).toContain("minha empresa");

    console_.assertClean();
  });

  test("as 3 portas têm CTA de WhatsApp com mensagem contextual por origem", async ({ page }) => {
    await page.goto("/solucoes");

    const sites = page.getByRole("link", { name: "Quero melhorar meu site" });
    const trafego = page.getByRole("link", { name: "Quero gerar mais oportunidades" });
    const presenca = page.getByRole("link", { name: "Quero organizar minha presença digital" });

    for (const l of [sites, trafego, presenca]) {
      await l.scrollIntoViewIfNeeded();
      await expect(l).toBeVisible();
    }

    const a = await ctaTarget(sites);
    const b = await ctaTarget(trafego);
    const c = await ctaTarget(presenca);

    // Com o número configurado no build, cada origem carrega um texto distinto.
    if (a.isWa && b.isWa && c.isWa) {
      expect(new Set([a.text, b.text, c.text]).size, "cada porta tem mensagem própria").toBe(3);
      expect(a.text.toLowerCase()).toContain("site");
      expect(b.text.toLowerCase()).toMatch(/tráfego|aquisição/);
      expect(c.text.toLowerCase()).toContain("presença digital");
      // mesmo número em todas
      const num = (h: string) => new URL(h).pathname;
      expect(num(a.href)).toBe(num(b.href));
      expect(num(b.href)).toBe(num(c.href));
    }
  });

  test("tabs de segmento trocam o cenário exibido", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/solucoes");

    const tablist = page.getByRole("tablist", { name: "Segmentos de negócio" });
    await tablist.scrollIntoViewIfNeeded();

    await tablist.getByRole("tab", { name: "Clínicas odontológicas" }).click();
    await expect(page.getByText("Página do tratamento", { exact: true })).toBeVisible();

    await tablist.getByRole("tab", { name: "Clínicas de estética" }).click();
    await expect(page.getByText("Página do procedimento", { exact: true })).toBeVisible();
    await expect(page.getByText("Página do tratamento", { exact: true })).toHaveCount(0);

    console_.assertClean();
  });

  test("FAQ abre e fecha um item", async ({ page }) => {
    await page.goto("/solucoes");

    const pergunta = page.getByRole("button", { name: /^Quanto custa\?/i });
    await pergunta.scrollIntoViewIfNeeded();
    await expect(pergunta).toHaveAttribute("aria-expanded", "false");

    await pergunta.click();
    await expect(pergunta).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText(/Depende do ponto de partida/i)).toBeVisible();

    await pergunta.click();
    await expect(pergunta).toHaveAttribute("aria-expanded", "false");
  });

  test("percorrer a página não deixa erro de JS", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/solucoes");
    await scrollThroughPage(page);
    await expectContentRevealed(page, "(/solucoes)");
    console_.assertClean();
  });
});

test.describe("/solucoes — mobile 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("sem scroll horizontal", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/solucoes");
    await scrollThroughPage(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, "não pode haver overflow horizontal em /solucoes no mobile").toBeLessThanOrEqual(1);
  });
});

test.describe("/solucoes — reduced-motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("conteúdo visível, sem erro de JS", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/solucoes");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await scrollThroughPage(page);
    await expectContentRevealed(page, "(reduced-motion /solucoes)");
    console_.assertClean();
  });
});
