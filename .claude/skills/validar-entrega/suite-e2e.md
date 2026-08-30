# Suíte E2E do site da Noryos — Playwright

> Implementada em 29–30/08/2026. Segunda camada do Quality Gate WEB/UI
> (a primeira é `/revisar-site-noryos`; a terceira é inspeção visual
> humana, que o Playwright **não** substitui).

## Onde

`projetos/Noryos-Inovacoes/site/`

- `playwright.config.ts` — Chromium headless, roda contra o **build de
  produção** (`webServer: npm run start`). `PW_DEV=1` usa `next dev`.
- `e2e/*.spec.ts` — os testes.
- `e2e/helpers.ts` — utilidades (watch de console/asset, scroll, evidência).
- `e2e/tsconfig.json` — TS isolado do app (o `tsconfig.json` do app
  exclui `e2e/`).
- `e2e/__evidence__/` — screenshots de evidência (git-ignorado).

## Como rodar

```bash
cd projetos/Noryos-Inovacoes/site
npm run quality            # lint + build + E2E — o portão completo
npm run test:e2e           # só o Playwright (precisa de build antes)
npm run test:e2e:headed    # navegador visível
npm run test:e2e:ui        # runner interativo
npx playwright install chromium   # 1ª vez numa máquina nova
npx playwright show-report        # relatório HTML da última rodada
```

## O que a suíte cobre

| Spec | Cobertura |
|---|---|
| `home.spec.ts` | 200, Header/logo(carregada)/CTA, âncoras de seção, **zero** erro de JS e **zero** 404 de asset crítico |
| `navigation.spec.ts` | nav desktop → rotas certas; CTA com href válido (wa.me ou mailto); menu mobile 390px abre/navega; sem scroll horizontal (medido com reduced-motion pra ignorar transform de reveal) |
| `sections.spec.ts` | Noryos OS Explorer troca a categoria (`data-selected` + `<h3>`); FAQ abre/fecha (via `grid-template-rows`) |
| `diagnostico.spec.ts` | página + form; bloqueio de avanço sem obrigatórios; 5 etapas; consentimento LGPD; voltar preserva dado. **Nunca envia** (sem lead falso; honeypot `input[name=website]` intocado) |
| `routes.spec.ts` | 9 rotas do `sitemap.ts` → 200 + `<title>`/`<h1>` + header/footer; `sitemap.xml` conta locs; `robots.txt`; 404 real |
| `metadata.spec.ts` | title/description por página, canonical absoluto, OG + Twitter no HTML final, `/icon.png` `/apple-icon.png` `/favicon.ico` `/opengraph-image.png` → 200 + MIME `image/*`, JSON-LD Organization+WebSite parseável |
| `motion.spec.ts` | depois do scroll, todo `h1/h2` passa em `checkVisibility({opacityProperty})` (reveal não deixou nada preso em opacity 0); interações pós-scroll; console limpo |
| `reduced-motion.spec.ts` | `emulateMedia({reducedMotion:'reduce'})` em `/`, `/diagnostico`, `/solucoes`: conteúdo continua visível, `.scroll-progress` some, console limpo — **regressão do bug de reveal** |
| `screenshots.spec.ts` | evidência: Home desktop, Home mobile 390, Noryos OS, Diagnóstico |

## Regras pra estender (não criar teste frágil)

- Seletor por **role / label / texto acessível**. Nada de classe Tailwind
  volátil. `data-testid` só quando não há âncora semântica — não em tudo.
- **Sem `waitForTimeout` arbitrário** como sincronização. Usar
  `expect.poll`, `toPass`, `checkVisibility`, ou esperar um estado real
  (`aria-expanded`, URL, texto).
- Motion: não validar estética. Validar que **conteúdo fica visível**,
  interação funciona, reduced-motion não esconde nada, console limpo.
- Diagnóstico: nunca disparar o submit real numa rodada normal (evita
  lead/spam e ação externa). Envio ponta a ponta é teste de integração
  à parte, com Supabase de teste e limpeza.
- Achou bug real? Corrige a **aplicação** e retesta. Não afrouxa o teste.
- Rota nova no `sitemap.ts` → adicionar em `e2e/helpers.ts` (`PUBLIC_ROUTES`).

## Notas de ambiente

- `next start` emite um aviso com `output: "standalone"` ("use
  `node .next/standalone/server.js`") mas **serve o build corretamente** —
  a suíte roda contra ele sem problema. Fidelidade de produção
  suficiente pro gate; o server standalone real é exercido no deploy.
- Node 20+ / o Chromium do Playwright é baixado uma vez por máquina
  (`~/AppData/Local/ms-playwright`), fora do repo.
- CI ainda não configurado — quando for, `forbidOnly`/`retries`/`workers`
  já reagem a `process.env.CI`.
