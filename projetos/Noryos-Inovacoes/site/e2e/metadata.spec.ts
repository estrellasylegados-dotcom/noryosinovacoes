import { test, expect } from "@playwright/test";

/**
 * Metadata técnica: valida a tag FINAL no HTML servido (não o arquivo fonte),
 * URL absoluta, e que os ícones respondem 200 com MIME de imagem — foi o que
 * quebrou logo/favicon em produção antes (documento em cache apontando pra
 * asset removido).
 */
test.describe("SEO / metadata / Open Graph / favicon", () => {
  test("Home tem title, canonical absoluto, OG e Twitter no <head>", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Noryos Inovações/);

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", /^https?:\/\/.+/);

    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Noryos/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /\S/);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image"
    );
  });

  test("cada página tem title e description próprios", async ({ page }) => {
    const paginas: Array<[string, RegExp]> = [
      ["/solucoes", /Soluções para diferentes etapas/i],
      ["/sobre", /Sobre a Noryos/i],
      ["/diagnostico", /Diagnóstico Digital Noryos/i],
      ["/contato", /Contato/i],
      ["/politica-de-privacidade", /Política de Privacidade/i],
    ];
    for (const [rota, tituloRe] of paginas) {
      await page.goto(rota);
      await expect(page, `title de ${rota}`).toHaveTitle(tituloRe);
      await expect(
        page.locator('meta[name="description"]'),
        `description de ${rota}`
      ).toHaveAttribute("content", /\S/);
    }
  });

  test("ícones (favicon/apple) e imagem OG respondem 200 com MIME de imagem", async ({ request }) => {
    for (const asset of ["/icon.png", "/apple-icon.png", "/favicon.ico", "/opengraph-image.png"]) {
      const res = await request.get(asset);
      expect(res.status(), `${asset} deve responder 200`).toBe(200);
      expect(res.headers()["content-type"], `${asset} MIME`).toMatch(/^image\//);
    }
  });

  test("structured data (Organization + WebSite) é JSON válido", async ({ page }) => {
    await page.goto("/");
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks.length).toBeGreaterThanOrEqual(2);
    const types = blocks.map((b) => JSON.parse(b)["@type"]);
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
  });
});
