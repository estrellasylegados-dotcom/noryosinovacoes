import { test, expect } from "@playwright/test";
import { watchConsole } from "./helpers";

/**
 * Esteira de Automação (§14, AutomationConveyor). Não valida estética —
 * valida que o ciclo dirigido por rAF PROGRIDE de fato (Lead → WhatsApp →
 * CRM → Follow-up → conclui → reinicia), que nenhuma etapa some, que não há
 * overflow horizontal e que reduced-motion cai no estado final sem loop.
 *
 * "O código da animação existe" não é validação — estes testes observam o
 * atributo `data-stage` mudando ao longo do tempo real.
 */

const CV = "#solucoes .cv";

test.describe("Automação — esteira operacional (desktop 1440)", () => {
  test("o ciclo percorre as 4 etapas na ordem e reinicia", async ({ page }) => {
    test.setTimeout(60_000);
    const console_ = watchConsole(page);
    await page.goto("/");

    const cv = page.locator(CV);
    await cv.scrollIntoViewIfNeeded();
    await expect(cv).toBeVisible();

    const stageNow = () => cv.getAttribute("data-stage");

    // Progressão 1 → 2 → 3 → 4 (Lead já entra em 0). Cada etapa tem uma
    // janela larga (>1s) no ciclo de ~8,3s, então 20s cobre com folga.
    for (const alvo of ["1", "2", "3", "4"]) {
      await expect
        .poll(stageNow, {
          message: `a esteira deve chegar em data-stage=${alvo}`,
          timeout: 20_000,
        })
        .toBe(alvo);
    }

    // …e o ciclo reinicia (reset suave → volta pra 0).
    await expect
      .poll(stageNow, { message: "o ciclo deve reiniciar (data-stage=0)", timeout: 20_000 })
      .toBe("0");

    console_.assertClean();
  });

  test("no estágio do CRM: Lead e WhatsApp concluídos, CRM ativo, Follow-up ainda idle", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.goto("/");
    const cv = page.locator(CV);
    await cv.scrollIntoViewIfNeeded();

    await expect.poll(() => cv.getAttribute("data-stage"), { timeout: 20_000 }).toBe("2");

    const estados = await page
      .locator(`${CV} .cv--h .cv-node`)
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-state")));
    expect(estados).toEqual(["done", "done", "active", "idle"]);
  });

  test("as 4 etapas continuam visíveis o tempo todo (nada some)", async ({ page }) => {
    await page.goto("/");
    const cv = page.locator(CV);
    await cv.scrollIntoViewIfNeeded();

    for (const id of ["lead", "whatsapp", "crm", "followup"]) {
      await expect(
        page.locator(`${CV} .cv--h .cv-node[data-node="${id}"] .cv-node-label`)
      ).toBeVisible();
    }
  });

  test("sem overflow horizontal dentro do card", async ({ page }) => {
    await page.goto("/");
    const cv = page.locator(CV);
    await cv.scrollIntoViewIfNeeded();

    const overflow = await cv.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow, "a esteira não pode estourar a largura do card").toBeLessThanOrEqual(1);
  });
});

test.describe("Automação — breakpoint responsivo (~1180px)", () => {
  for (const { w, layout, sel, hidden } of [
    { w: 1280, layout: "horizontal", sel: ".cv--h", hidden: ".cv--v" },
    { w: 1179, layout: "vertical", sel: ".cv--v", hidden: ".cv--h" },
    { w: 1024, layout: "vertical", sel: ".cv--v", hidden: ".cv--h" },
    { w: 768, layout: "vertical", sel: ".cv--v", hidden: ".cv--h" },
  ]) {
    test(`${w}px usa o layout ${layout}, sem overflow`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/");
      const cv = page.locator(CV);
      await cv.scrollIntoViewIfNeeded();

      await expect(page.locator(`${CV} ${sel}`)).toBeVisible();
      await expect(page.locator(`${CV} ${hidden}`)).toBeHidden();

      const overflow = await cv.evaluate((el) => el.scrollWidth - el.clientWidth);
      expect(overflow, `esteira não pode estourar a largura em ${w}px`).toBeLessThanOrEqual(1);
    });
  }
});

test.describe("Automação — mobile 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("usa o layout vertical, labels legíveis, sem overflow no componente", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/");

    const cv = page.locator(CV);
    await cv.scrollIntoViewIfNeeded();

    await expect(page.locator(`${CV} .cv--v`)).toBeVisible();
    await expect(page.locator(`${CV} .cv--h`)).toBeHidden();

    for (const id of ["lead", "whatsapp", "crm", "followup"]) {
      await expect(
        page.locator(`${CV} .cv--v .cv-node[data-node="${id}"] .cv-node-label`)
      ).toBeVisible();
    }

    // O componente não pode introduzir overflow horizontal em 390px.
    // (A página tem um overflow pré-existente de ~4px no NoryosOSExplorer,
    // fora do escopo desta entrega.)
    const cvOverflow = await cv.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(cvOverflow, "a esteira vertical não pode estourar a largura").toBeLessThanOrEqual(1);

    // o ciclo também roda no mobile
    await expect.poll(() => cv.getAttribute("data-stage"), { timeout: 20_000 }).not.toBe("0");

    console_.assertClean();
  });
});

test.describe("Automação — reduced-motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("cai no estado final conectado, estável, sem loop", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/");

    expect(
      await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches),
      "a emulação de reduced-motion precisa estar ativa"
    ).toBe(true);

    const cv = page.locator(CV);
    await cv.scrollIntoViewIfNeeded();

    await expect(cv).toHaveAttribute("data-reduced", "true");
    await expect(cv).toHaveAttribute("data-stage", "4");

    const estados = await page
      .locator(`${CV} .cv--h .cv-node`)
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-state")));
    expect(estados, "todas as etapas concluídas, nenhuma ativa").toEqual([
      "done",
      "done",
      "done",
      "done",
    ]);

    await expect(page.locator(`${CV} .cv--h .cv-token`)).toBeHidden();

    // Continua estável: sem ciclo, data-stage não muda ao longo do tempo.
    await page.waitForTimeout(2500);
    await expect(cv).toHaveAttribute("data-stage", "4");

    console_.assertClean();
  });
});
