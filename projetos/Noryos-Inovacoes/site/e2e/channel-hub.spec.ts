import { test, expect, type Page } from "@playwright/test";
import { watchConsole } from "./helpers";

/**
 * §14 — card Conteúdo e Presença (ChannelHub). Uma estratégia central → 4
 * canais. Valida que ao entrar na viewport revela (data-revealed), que as 4
 * conexões e os 4 canais aparecem coerentes, que não há post/logo/moeda,
 * sem overflow, e que reduced-motion mostra o estado final conectado.
 */

const CH = "#solucoes .ch";

async function chTopTo(page: Page, off: number) {
  await page.evaluate((o) => {
    const el = document.querySelector("#solucoes .ch") as HTMLElement;
    window.scrollTo({
      top: window.scrollY + el.getBoundingClientRect().top - o,
      behavior: "instant" as ScrollBehavior,
    });
  }, off);
  await page.waitForTimeout(140);
}

test.describe("Conteúdo e Presença — hub de canais (desktop 1440)", () => {
  test("ao entrar na viewport revela: hub, 4 conexões, 4 canais coerentes", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/");

    const ch = page.locator(CH);

    // longe da viewport → não revelado
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
    await page.waitForTimeout(200);
    await expect(ch).not.toHaveAttribute("data-revealed", "true");

    // rolar até o card → revela
    await chTopTo(page, 300);
    await expect(ch).toHaveAttribute("data-revealed", "true");

    await expect(page.locator(`${CH} .ch-conn`)).toHaveCount(4);
    await expect(page.locator(`${CH} .ch-ch`)).toHaveCount(4);
    await expect(page.locator(`${CH} .ch-ch[data-state="active"]`)).toHaveCount(4);

    await expect(ch).toContainText("Mensagem central");
    await expect(ch).toContainText("Representação ilustrativa");
    for (const label of ["Site", "Instagram", "Google", "WhatsApp"]) {
      await expect(page.locator(`${CH} .ch-ch-label`, { hasText: new RegExp(`^${label}$`) })).toBeVisible();
    }

    // latch: continua revelado voltando ao topo
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
    await page.waitForTimeout(150);
    await expect(ch).toHaveAttribute("data-revealed", "true");

    console_.assertClean();
  });

  test("nada de post fictício, logo de plataforma ou moeda; sem overflow", async ({ page }) => {
    await page.goto("/");
    await chTopTo(page, 300);
    const txt = (await page.locator(CH).textContent()) ?? "";
    expect(txt).not.toMatch(/R\$|@|\bpost\b|seguidor|curtida/i);

    const overflow = await page.locator(CH).evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe("Conteúdo e Presença — mobile 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("2x2 ao redor do hub (não em linha), revela ao rolar, sem overflow", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/");

    await expect(page.locator(`${CH} .ch-ch`)).toHaveCount(4);

    // 2 canais acima do hub, 2 abaixo (não os 4 numa linha)
    const ys = await page
      .locator(`${CH} .ch-ch`)
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
    const hubY = await page
      .locator(`${CH} .ch-hub`)
      .evaluate((e) => e.getBoundingClientRect().top);
    expect(ys.filter((y) => y < hubY).length, "2 canais acima do hub").toBe(2);
    expect(ys.filter((y) => y > hubY).length, "2 canais abaixo do hub").toBe(2);

    await chTopTo(page, 200);
    await expect(page.locator(CH)).toHaveAttribute("data-revealed", "true");

    const overflow = await page.locator(CH).evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow, "sem overflow no componente").toBeLessThanOrEqual(1);

    console_.assertClean();
  });
});

test.describe("Conteúdo e Presença — reduced-motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("estado final conectado, estático", async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto("/");
    await page.locator(CH).scrollIntoViewIfNeeded();

    await expect(page.locator(CH)).toHaveAttribute("data-revealed", "true");
    await expect(page.locator(`${CH} .ch-conn`)).toHaveCount(4);
    await expect(page.locator(`${CH} .ch-ch[data-state="active"]`)).toHaveCount(4);

    const anim = await page
      .locator(`${CH} .ch-hub-dot`)
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(["none", ""]).toContain(anim);

    console_.assertClean();
  });
});
