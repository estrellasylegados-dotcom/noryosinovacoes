import { test, expect, type Page } from "@playwright/test";
import { watchConsole } from "./helpers";

/**
 * §2/§3 — "operação fragmentada → conectada" (OperationShift). Não valida
 * estética — valida que a transformação PROGRIDE com o scroll (data-t 0→1,
 * data-phase fragmented→morphing→connected), que os 7 nós e as conexões
 * renderizam, que não há overflow, e que reduced-motion cai no estado
 * conectado estático (sem zona de scroll longa, sem pulsos).
 */

const scrollZoneTo = (page: Page, frac: number) =>
  page.evaluate((f) => {
    const el = document.querySelector(".os-scroll") as HTMLElement;
    if (!el) return;
    window.scrollTo({
      top: window.scrollY + el.getBoundingClientRect().top - window.innerHeight * f,
      behavior: "instant" as ScrollBehavior,
    });
  }, frac);

const tOf = (page: Page) =>
  page.locator(".os-stage").evaluate((el) => Number(el.getAttribute("data-t")));
const phaseOf = (page: Page) =>
  page.locator(".os-stage").evaluate((el) => el.getAttribute("data-phase"));

test.describe("Operação fragmentada → conectada (desktop 1440)", () => {
  test("a transformação progride com o scroll: data-t 0 → 1, fases na ordem", async ({ page }) => {
    test.setTimeout(60_000);
    const console_ = watchConsole(page);
    await page.goto("/");

    // canvas ainda longe / entrando → fragmentado
    await scrollZoneTo(page, 0.1);
    await page.waitForTimeout(150);
    expect(await tOf(page), "começa perto de 0").toBeLessThan(0.15);
    expect(await phaseOf(page)).toBe("fragmented");

    // meio da zona colada → morphing, t no meio
    await scrollZoneTo(page, -0.18);
    await page.waitForTimeout(150);
    const mid = await tOf(page);
    expect(mid, "no meio o t está entre 0.2 e 0.85").toBeGreaterThan(0.2);
    expect(mid).toBeLessThan(0.9);
    expect(await phaseOf(page)).toBe("morphing");

    // fim da zona → conectado, t = 1
    await scrollZoneTo(page, -0.42);
    await page.waitForTimeout(150);
    expect(await tOf(page)).toBeGreaterThan(0.95);
    expect(await phaseOf(page)).toBe("connected");

    console_.assertClean();
  });

  test("renderiza os 7 nós rotulados e as conexões", async ({ page }) => {
    await page.goto("/");
    await scrollZoneTo(page, -0.42);
    await page.waitForTimeout(200);

    await expect(page.locator(".os-scroll .os-node")).toHaveCount(7);
    for (const label of ["Noryos OS", "Site", "Conteúdo", "Anúncios", "Leads", "Atendimento", "Dados"]) {
      await expect(
        page.locator(`.os-scroll .os-node .sys-node-label`, { hasText: new RegExp(`^${label}$`) })
      ).toBeVisible();
    }
    // no estado conectado há várias conexões traçadas
    expect(await page.locator(".os-scroll .sys-conn").count()).toBeGreaterThanOrEqual(6);
  });

  test("sem overflow horizontal na página com a seção", async ({ page }) => {
    await page.goto("/");
    await scrollZoneTo(page, -0.2);
    await page.waitForTimeout(150);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("as duas cópias (problema e resultado) continuam visíveis e legíveis", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Operação digital fragmentada/i })
    ).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(
      page.getByRole("heading", { name: /a operação vira sistema/i })
    ).toBeVisible();
  });
});

test.describe("Operação — mobile 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("usa a composição vertical própria; conecta ao rolar; sem overflow", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/");

    await expect(page.locator(".os-m")).toBeVisible();
    await expect(page.locator(".os-scroll")).toBeHidden();
    await expect(page.locator(".os-m .os-m-row")).toHaveCount(7);

    const m = page.locator(".os-m");
    await m.scrollIntoViewIfNeeded();
    // rola até quase passar totalmente por .os-m (uma tira ainda intersecta →
    // useScrollProgress sobe pra perto de 1)
    await page.evaluate(() => {
      const el = document.querySelector(".os-m") as HTMLElement;
      const r = el.getBoundingClientRect();
      window.scrollTo({
        top: window.scrollY + r.top + r.height - 70,
        behavior: "instant" as ScrollBehavior,
      });
    });
    await page.waitForTimeout(250);
    await expect
      .poll(async () => Number((await m.getAttribute("data-mt")) ?? "0"), { timeout: 8000 })
      .toBeGreaterThan(0.72);
    await expect(m).toHaveAttribute("data-connected", "true");

    // overflow escopado ao componente (a página tem ~4px pré-existentes de
    // reveal transiente no NoryosOSExplorer, fora do escopo desta entrega)
    const overflow = await m.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow, "a composição mobile não pode estourar a largura").toBeLessThanOrEqual(1);

    console_.assertClean();
  });
});

test.describe("Operação — reduced-motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("estado conectado estático, sem zona de scroll longa, sem pulsos", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/");

    await page.locator(".os-stage").scrollIntoViewIfNeeded();
    await expect(page.locator(".os-stage")).toHaveAttribute("data-phase", "connected");
    expect(await tOf(page)).toBe(1);

    // a zona de 135vh colapsa
    const h = await page.locator(".os-scroll").evaluate((el) => el.getBoundingClientRect().height);
    const vh = await page.evaluate(() => window.innerHeight);
    expect(h, "a zona de scroll não fica com 135vh em reduced-motion").toBeLessThan(vh * 1.2);

    // pulsos não animam
    const running = await page.locator(".os-pulse--run").count();
    if (running > 0) {
      const anim = await page
        .locator(".os-pulse--run")
        .first()
        .evaluate((el) => getComputedStyle(el).animationName);
      expect(["none", ""]).toContain(anim);
    }

    console_.assertClean();
  });
});
