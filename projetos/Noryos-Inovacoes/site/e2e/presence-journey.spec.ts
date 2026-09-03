import { test, expect, type Page } from "@playwright/test";
import { watchConsole } from "./helpers";

/**
 * §14 — card Presença Digital (PresenceJourney). Valida que a jornada
 * PROGRIDE com o scroll (data-journey 0→1, bloco ativo Hero→…→Contato), que
 * o Contato ACENDE (data-state=done), que desktop e mobile ficam
 * SINCRONIZADOS (mesmo bloco aceso), sem overflow, e que reduced-motion
 * mostra a jornada concluída estática.
 */

const PJ = "#solucoes .pj";

async function pjTopTo(page: Page, off: number) {
  await page.evaluate((o) => {
    const el = document.querySelector("#solucoes .pj") as HTMLElement;
    window.scrollTo({
      top: window.scrollY + el.getBoundingClientRect().top - o,
      behavior: "instant" as ScrollBehavior,
    });
  }, off);
  await page.waitForTimeout(140);
}
const jOf = (page: Page) =>
  page.locator(PJ).evaluate((el) => Number(el.getAttribute("data-journey")));

// índice do bloco aceso (active|passed|done mais avançado) num dos frames
const litIndex = (page: Page, frame: string) =>
  page.evaluate((sel) => {
    const blocks = [...document.querySelectorAll(`${sel} .pj-block`)];
    let last = -1;
    blocks.forEach((b, i) => {
      const s = b.getAttribute("data-state");
      if (s === "active" || s === "passed" || s === "done") last = i;
    });
    return last;
  }, `${PJ} ${frame}`);

test.describe("Presença Digital — jornada (desktop 1440)", () => {
  test("a jornada progride com o scroll: data-journey 0 → 1, bloco ativo desce", async ({ page }) => {
    test.setTimeout(60_000);
    const console_ = watchConsole(page);
    await page.goto("/");

    await pjTopTo(page, 820);
    expect(await jOf(page), "começa perto de 0").toBeLessThan(0.2);

    await pjTopTo(page, 400);
    const mid = await jOf(page);
    expect(mid).toBeGreaterThan(0.3);
    expect(mid).toBeLessThan(0.95);

    await pjTopTo(page, 140);
    await expect
      .poll(() => jOf(page), { timeout: 6000 })
      .toBeGreaterThan(0.95);

    // Contato aceso ("done") no fim
    await expect(
      page.locator(`${PJ} .pj-frame--desktop .pj-block[data-id="contato"]`)
    ).toHaveAttribute("data-state", "done");

    console_.assertClean();
  });

  test("desktop e mobile mostram a MESMA profundidade (sincronizados)", async ({ page }) => {
    await page.goto("/");
    for (const off of [700, 460, 300, 160]) {
      await pjTopTo(page, off);
      const [d, m] = await Promise.all([
        litIndex(page, ".pj-frame--desktop"),
        litIndex(page, ".pj-frame--mobile"),
      ]);
      expect(m, `frac ${off}: mesmo bloco aceso nos dois frames`).toBe(d);
    }
  });

  test("cada frame tem os 4 blocos e sem overflow", async ({ page }) => {
    await page.goto("/");
    await pjTopTo(page, 300);
    await expect(page.locator(`${PJ} .pj-frame--desktop .pj-block`)).toHaveCount(4);
    await expect(page.locator(`${PJ} .pj-frame--mobile .pj-block`)).toHaveCount(4);

    const overflow = await page.locator(PJ).evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe("Presença Digital — mobile 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("empilha os dois frames (browser em cima), progride, sincroniza, sem overflow", async ({
    page,
  }) => {
    const console_ = watchConsole(page);
    await page.goto("/");

    const desk = page.locator(`${PJ} .pj-frame--desktop`);
    const mob = page.locator(`${PJ} .pj-frame--mobile`);
    await expect(desk).toBeVisible();
    await expect(mob).toBeVisible();

    // empilhado: browser acima do telefone
    const [db, mb] = await Promise.all([desk.boundingBox(), mob.boundingBox()]);
    expect(db && mb && db.y + db.height <= mb.y + 4, "browser acima do telefone").toBeTruthy();

    // progride ao rolar
    await pjTopTo(page, 800);
    const start = await jOf(page);
    await pjTopTo(page, 160);
    await expect.poll(() => jOf(page), { timeout: 6000 }).toBeGreaterThan(start + 0.3);

    // sincronizado: mesmo bloco aceso nos dois; Contato concluído nos dois
    const [d, m] = await Promise.all([
      litIndex(page, ".pj-frame--desktop"),
      litIndex(page, ".pj-frame--mobile"),
    ]);
    expect(m).toBe(d);
    for (const f of [".pj-frame--desktop", ".pj-frame--mobile"]) {
      await expect(page.locator(`${PJ} ${f} .pj-block[data-id="contato"]`)).toHaveAttribute(
        "data-state",
        "done"
      );
    }

    const overflow = await page.locator(PJ).evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow, "a ilustração não pode estourar a largura").toBeLessThanOrEqual(1);

    console_.assertClean();
  });
});

test.describe("Presença Digital — reduced-motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("jornada concluída, estática, sem ponto pulsando", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/");
    await page.locator(PJ).scrollIntoViewIfNeeded();

    await expect(page.locator(PJ)).toHaveAttribute("data-journey", "1.00");
    await expect(
      page.locator(`${PJ} .pj-frame--desktop .pj-block[data-id="contato"]`)
    ).toHaveAttribute("data-state", "done");
    await expect(page.locator(`${PJ} .pj-dot`)).toHaveCount(0);

    console_.assertClean();
  });
});
