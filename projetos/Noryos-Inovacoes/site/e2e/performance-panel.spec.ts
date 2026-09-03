import { test, expect } from "@playwright/test";
import { watchConsole } from "./helpers";

/**
 * Painel de Aquisição e Performance (§14, PerformancePanel). Valida que o
 * traçado se revela com o scroll (--plot), que os indicadores entram, que
 * NÃO há número absoluto/moeda, e que reduced-motion cai no traçado
 * completo estático.
 */

const PP = "#solucoes .pp";

test.describe("Aquisição — painel de leitura (desktop 1440)", () => {
  test("renderiza as duas linhas, 3 indicadores e o rótulo de exemplo", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/");

    const pp = page.locator(PP);
    await pp.scrollIntoViewIfNeeded();
    await expect(pp).toBeVisible();

    await expect(page.locator(`${PP} .pp-line--inv`)).toHaveCount(1);
    await expect(page.locator(`${PP} .pp-line--ret`)).toHaveCount(1);
    await expect(page.locator(`${PP} .pp-kpi`)).toHaveCount(3);
    await expect(page.locator(PP)).toContainText("Exemplo de acompanhamento");
    await expect(page.locator(PP)).toContainText("Custo / lead");
    await expect(page.locator(PP)).toContainText("Conversão");
    await expect(page.locator(PP)).toContainText("Retorno");

    console_.assertClean();
  });

  test("nada de número absoluto nem moeda no painel", async ({ page }) => {
    await page.goto("/");
    const pp = page.locator(PP);
    await pp.scrollIntoViewIfNeeded();
    const txt = (await pp.textContent()) ?? "";
    expect(txt, "sem R$ / moeda").not.toMatch(/R\$|BRL|reais/i);
    // só variação relativa (%) e a palavra índice
    expect(txt).toMatch(/%/);
    expect(txt.toLowerCase()).toContain("índice");
  });

  test("antes do scroll o painel está em repouso; ao entrar na viewport revela o traçado", async ({
    page,
  }) => {
    await page.goto("/");
    const pp = page.locator(PP);

    // painel ainda longe da viewport → sem data-revealed, sem ponto de decisão
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
    await page.waitForTimeout(250);
    await expect(pp).not.toHaveAttribute("data-revealed", "true");
    await expect(page.locator(`${PP} .pp-decision-tag`)).toHaveCount(0);
    // mas as linhas já existem (repouso lê como gráfico, não como algo quebrado)
    await expect(page.locator(`${PP} .pp-line--ret`)).toHaveCount(1);

    // rolar até o painel → revela (linhas, margem, decisão, indicadores)
    await pp.scrollIntoViewIfNeeded();
    await expect(pp).toHaveAttribute("data-revealed", "true");
    await expect(page.locator(`${PP} .pp-decision-tag`)).toBeVisible();
    await expect(page.locator(`${PP} .pp-kpi.is-in`)).toHaveCount(3);

    // latching: continua revelado mesmo voltando pro topo
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
    await page.waitForTimeout(200);
    await expect(pp).toHaveAttribute("data-revealed", "true");
  });

  test("hover no gráfico mostra o scrubber e o índice da semana", async ({ page }) => {
    await page.goto("/");
    const pp = page.locator(PP);
    await pp.scrollIntoViewIfNeeded();

    const box = await page.locator(`${PP} .pp-chart`).boundingBox();
    if (!box) throw new Error("sem bounding box do gráfico");
    const y = box.y + box.height * 0.5;
    // dois moves garantem que o pointermove dispare (delta > 0)
    await page.mouse.move(box.x + box.width * 0.28, y);
    await page.mouse.move(box.x + box.width * 0.34, y);

    await expect(pp).toHaveAttribute("data-hover", "true");
    await expect(page.locator(`${PP} .pp-scrub`)).toHaveCount(1);
    await expect(page.locator(`${PP} .pp-readout`)).toBeVisible();
    await expect(page.locator(`${PP} .pp-readout`)).toContainText("índice");

    await page.mouse.move(box.x - 60, box.y - 60);
    await expect(page.locator(`${PP} .pp-scrub`)).toHaveCount(0);
  });

  test("sem overflow horizontal no painel", async ({ page }) => {
    await page.goto("/");
    const pp = page.locator(PP);
    await pp.scrollIntoViewIfNeeded();
    const overflow = await pp.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe("Aquisição — larguras", () => {
  for (const w of [1280, 1024, 768, 390]) {
    test(`${w}px sem overflow, indicadores visíveis`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/");
      const pp = page.locator(PP);
      await pp.scrollIntoViewIfNeeded();

      await expect(page.locator(`${PP} .pp-kpi`)).toHaveCount(3);
      const overflow = await pp.evaluate((el) => el.scrollWidth - el.clientWidth);
      expect(overflow, `painel não pode estourar em ${w}px`).toBeLessThanOrEqual(1);
    });
  }
});

test.describe("Aquisição — reduced-motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("traçado completo e estático, sem pulso", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/");

    expect(
      await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)
    ).toBe(true);

    const pp = page.locator(PP);
    await pp.scrollIntoViewIfNeeded();

    // já revelado, traçado completo de imediato
    await expect(pp).toHaveAttribute("data-revealed", "true");
    await expect(page.locator(`${PP} .pp-line--ret`)).toBeVisible();
    await expect(page.locator(`${PP} .pp-decision-tag`)).toBeVisible();
    await expect(page.locator(`${PP} .pp-kpi`)).toHaveCount(3);

    // ponto "ao vivo" não está animando
    const animName = await page
      .locator(`${PP} .pp-live`)
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(["none", ""]).toContain(animName);

    console_.assertClean();
  });
});
