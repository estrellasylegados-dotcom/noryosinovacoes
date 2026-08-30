import { test, expect } from "@playwright/test";
import { PUBLIC_ROUTES, watchConsole } from "./helpers";

test.describe("Rotas principais", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`GET ${route} → 200, com <title> e <h1>`, async ({ page }) => {
      const console_ = watchConsole(page);
      const res = await page.goto(route);
      expect(res?.status(), `${route} deve responder 200`).toBe(200);

      await expect(page).toHaveTitle(/\S/); // título não-vazio
      await expect(page.locator("h1")).not.toHaveCount(0);

      // header e footer em toda página
      await expect(page.locator("header.site-header")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();

      console_.assertClean();
    });
  }

  test("sitemap.xml e robots.txt respondem", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(sitemap.headers()["content-type"]).toContain("xml");

    const body = await sitemap.text();
    const locs = body.match(/<loc>/g) ?? [];
    expect(locs.length, "sitemap deve listar todas as rotas públicas").toBe(PUBLIC_ROUTES.length);
    for (const route of ["/solucoes/sites", "/diagnostico", "/politica-de-privacidade"]) {
      expect(body, `sitemap deve conter ${route}`).toContain(`${route}</loc>`);
    }

    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Sitemap:");
  });

  test("404 de rota inexistente", async ({ page }) => {
    const res = await page.goto("/rota-que-nao-existe-123");
    expect(res?.status()).toBe(404);
  });
});
