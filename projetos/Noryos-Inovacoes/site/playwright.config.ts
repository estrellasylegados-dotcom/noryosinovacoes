import { defineConfig, devices } from "@playwright/test";

/**
 * Segunda camada do Quality Gate da Noryos (ver a seção "QUALITY GATE /
 * DEFINITION OF DONE" no CLAUDE.md da raiz do workspace e a skill
 * `/validar-entrega`). Testa o SITE contra o **build de produção**
 * (`next build` + `next start`) — dev não é suficiente porque o
 * comportamento de produção pode diferir.
 *
 * Um único browser (Chromium) de propósito: suíte enxuta, rápida e estável.
 * Viewport mobile (390px) e `prefers-reduced-motion` são aplicados por spec
 * via `test.use(...)`, não como projetos separados.
 *
 * Rodar: `npm run test:e2e` (exige `npm run build` antes) ou `npm run quality`
 * (lint + build + e2e numa tacada). `PW_DEV=1` troca o servidor pra `next dev`.
 */

const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const useDevServer = process.env.PW_DEV === "1";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  timeout: 30_000,
  expect: { timeout: 7_000 },

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],

  webServer: {
    command: useDevServer ? "npm run dev" : "npm run start",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
    /**
     * Ambiente do servidor sob teste. Nada de e-mail real nem Supabase real:
     * - provedor de e-mail `mock` grava em .data/diagnostico.email-mock.jsonl
     * - fallback local de persistência liberado explicitamente (o servidor
     *   roda em NODE_ENV=production via `next start`)
     * - rate limit apertado nas duas janelas (curta 3 / 2,5 s, longa 5 / 12 s)
     *   pra os testes exercitarem bloqueio e expiração de cada uma sem esperar
     *   15 min / 24 h
     * - Turnstile em modo `mock`: o resultado vem do próprio token (contém
     *   "pass" ou o dummy da Cloudflare = ok; ausente/qualquer outro = falha).
     *   Nenhuma chamada de rede à Cloudflare. O widget do formulário NÃO é
     *   renderizado nos testes (sem NEXT_PUBLIC_TURNSTILE_SITE_KEY no build);
     *   os testes de browser injetam o token no POST (ver
     *   `attachTurnstileToken` em e2e/helpers.ts) e os de contrato mandam o
     *   token direto no corpo.
     */
    env: {
      DIAGNOSTIC_EMAIL_PROVIDER: "mock",
      DIAGNOSTIC_NOTIFICATION_EMAIL: "qa-inbox@noryos.test",
      DIAGNOSTIC_ALLOW_FILE_FALLBACK: "1",
      DIAGNOSTIC_RATELIMIT_SHORT_MAX: "3",
      DIAGNOSTIC_RATELIMIT_SHORT_WINDOW_MS: "2500",
      DIAGNOSTIC_RATELIMIT_LONG_MAX: "5",
      DIAGNOSTIC_RATELIMIT_LONG_WINDOW_MS: "12000",
      TURNSTILE_MODE: "mock",
    },
  },
});
