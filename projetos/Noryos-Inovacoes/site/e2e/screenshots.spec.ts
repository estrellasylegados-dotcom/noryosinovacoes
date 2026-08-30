import { test } from "@playwright/test";
import { scrollThroughPage, evidenceShot } from "./helpers";

/**
 * Screenshots de EVIDÊNCIA (não é regressão de pixel). Saem em
 * `e2e/__evidence__/` e ficam anexados ao relatório HTML. Servem pra
 * inspeção visual humana — que continua obrigatória: Playwright não aprova
 * estética. Regenerar: `npm run test:e2e -- screenshots`.
 */
test.describe("Evidência visual", () => {
  test("Home — desktop", async ({ page }, testInfo) => {
    await page.goto("/");
    await scrollThroughPage(page);
    await evidenceShot(page, testInfo, "home-desktop");
  });

  test("Home — mobile 390px", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await scrollThroughPage(page);
    await evidenceShot(page, testInfo, "home-mobile-390");
  });

  test("Noryos OS — seção", async ({ page }, testInfo) => {
    await page.goto("/#noryos-os");
    await page.locator("#noryos-os").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await evidenceShot(page, testInfo, "noryos-os");
  });

  test("Diagnóstico — formulário", async ({ page }, testInfo) => {
    await page.goto("/diagnostico");
    await page.waitForTimeout(400);
    await evidenceShot(page, testInfo, "diagnostico");
  });
});
