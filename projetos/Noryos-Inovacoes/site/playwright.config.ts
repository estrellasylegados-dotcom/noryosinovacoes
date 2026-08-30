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
  },
});
