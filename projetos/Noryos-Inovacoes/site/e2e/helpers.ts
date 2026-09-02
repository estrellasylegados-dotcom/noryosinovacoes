import path from "node:path";
import { expect, type Page, type TestInfo } from "@playwright/test";

/** Pasta de screenshots de evidência (git-ignorada, regenerável). */
export const EVIDENCE_DIR = path.join(process.cwd(), "e2e", "__evidence__");

/**
 * Rotas públicas do site (espelha `src/app/sitemap.ts`). Se uma rota nova
 * entrar no sitemap, adicionar aqui — o teste de rotas vai cobri-la.
 */
export const PUBLIC_ROUTES = [
  "/",
  "/solucoes",
  "/solucoes/sites",
  "/solucoes/automacoes",
  "/solucoes/performance",
  "/sobre",
  "/diagnostico",
  "/contato",
  "/politica-de-privacidade",
] as const;

/**
 * Ruído conhecido de console que NÃO é bug do site — filtrado com
 * justificativa. Nunca adicionar aqui pra "fazer o teste passar": só
 * mensagens comprovadamente externas ao nosso código.
 */
const CONSOLE_NOISE = [
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i, // só aparece em dev (PW_DEV=1)
];

type ConsoleWatcher = {
  /** Falha o teste se algo relevante foi para o console.error / pageerror. */
  assertClean: () => void;
  errors: string[];
};

/**
 * Começa a observar erros de JS (console.error + exceções não tratadas).
 * Chamar ANTES de `page.goto`. No fim do teste, chamar `assertClean()`.
 */
export function watchConsole(page: Page): ConsoleWatcher {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (CONSOLE_NOISE.some((re) => re.test(text))) return;
    errors.push(`console.error: ${text}`);
  });

  page.on("pageerror", (err) => {
    errors.push(`pageerror: ${err.message}`);
  });

  return {
    errors,
    assertClean() {
      expect(errors, `Erros de JS no navegador:\n${errors.join("\n")}`).toEqual([]);
    },
  };
}

/**
 * Observa respostas HTTP com status >= 400 para assets críticos (scripts,
 * estilos, fontes, imagens de marca). 404 de asset é bug de deploy — foi
 * exatamente o que quebrou logo/favicon em produção antes.
 */
export function watchFailedAssets(page: Page): { assertClean: () => void; failures: string[] } {
  const failures: string[] = [];

  page.on("response", (res) => {
    const status = res.status();
    if (status < 400) return;
    const url = res.url();
    const type = res.request().resourceType();
    if (["script", "stylesheet", "font", "image"].includes(type)) {
      failures.push(`${status} ${type} → ${url}`);
    }
  });

  return {
    failures,
    assertClean() {
      expect(failures, `Assets críticos falharam:\n${failures.join("\n")}`).toEqual([]);
    },
  };
}

/** Rola a página inteira em passos, deixando o motion system disparar. */
export async function scrollThroughPage(page: Page, step = 600, pause = 160) {
  await page.evaluate(
    async ({ step, pause }) => {
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await sleep(pause);
      }
      window.scrollTo(0, document.body.scrollHeight);
      await sleep(400);
      window.scrollTo(0, 0);
      await sleep(150);
    },
    { step, pause }
  );
}

/**
 * Percorre a página seção a seção (como um usuário faria) e garante que cada
 * título — e o rodapé — fica REALMENTE visível: `checkVisibility` com
 * `opacityProperty` retorna false se o próprio elemento OU um ancestral
 * estiver em opacity 0 (o estado inicial de `[data-anim]` quando o reveal
 * não dispara — o bug que já aconteceu). Não audita cada nó animado (isso
 * pega stragglers em transição e vira teste frágil); audita o conteúdo.
 */
export async function expectContentRevealed(page: Page, label = "") {
  const headings = page.locator("main h1, main h2");
  const count = await headings.count();
  expect(count, `a página deve ter títulos de seção ${label}`.trim()).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const h = headings.nth(i);
    await h.scrollIntoViewIfNeeded();
    await expect
      .poll(
        () =>
          h.evaluate((el) =>
            el.checkVisibility({
              opacityProperty: true,
              visibilityProperty: true,
              contentVisibilityAuto: true,
            })
          ),
        {
          message: `título #${i + 1} ficou invisível (reveal preso em opacity 0?) ${label}`.trim(),
          timeout: 4000,
        }
      )
      .toBe(true);
  }

  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(page.locator("footer")).toBeVisible();
}
/**
 * A verificação do Cloudflare Turnstile é OBRIGATÓRIA no `POST /api/diagnostico`
 * (ver `src/lib/turnstile.ts`). Nos testes de browser o widget não é
 * renderizado (sem `NEXT_PUBLIC_TURNSTILE_SITE_KEY` no build de teste), então
 * este helper injeta um `turnstileToken` válido no corpo do POST — o servidor
 * sob teste roda com `TURNSTILE_MODE=mock`, que aceita qualquer token com
 * "pass". Chamar ANTES de submeter o formulário.
 *
 * Os caminhos "token ausente / inválido → 403" são cobertos direto no
 * endpoint por `diagnostico-api.spec.ts`, sem browser.
 */
export async function attachTurnstileToken(
  page: Page,
  opts: { token?: string; delayMs?: number } = {}
) {
  const { token = "pass", delayMs = 0 } = opts;
  await page.route("**/api/diagnostico", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(route.request().postData() ?? "{}");
    } catch {
      return route.continue();
    }
    await route.continue({ postData: JSON.stringify({ ...body, turnstileToken: token }) });
  });
}

export async function evidenceShot(page: Page, testInfo: TestInfo, name: string) {
  const file = path.join(EVIDENCE_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await testInfo.attach(name, { path: file, contentType: "image/png" });
}
