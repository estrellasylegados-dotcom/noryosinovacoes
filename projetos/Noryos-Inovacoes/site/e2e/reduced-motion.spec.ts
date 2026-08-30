import { test, expect } from "@playwright/test";
import { watchConsole, scrollThroughPage, expectContentRevealed } from "./helpers";

/**
 * `prefers-reduced-motion: reduce` NÃO pode apagar a página. O motion system
 * ainda adiciona `.is-in` (só o deslocamento some) — se o JS falhar em
 * adicionar, `[data-anim]` fica preso em opacity 0 e o conteúdo some. Este
 * teste existe por causa desse risco concreto (bug de reveal que já ocorreu).
 */
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const rota of ["/", "/diagnostico", "/solucoes"]) {
  test(`reduced-motion em ${rota}: conteúdo visível, sem erro de JS`, async ({ page }) => {
    const console_ = watchConsole(page);
    await page.goto(rota);

    expect(
      await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches),
      "a emulação de reduced-motion precisa estar ativa"
    ).toBe(true);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await scrollThroughPage(page);
    await expectContentRevealed(page, `(reduced-motion ${rota})`);

    if (rota === "/") {
      // barra de progresso de scroll é desligada em reduced-motion
      await expect(page.locator(".scroll-progress")).toBeHidden();
    }

    console_.assertClean();
  });
}
