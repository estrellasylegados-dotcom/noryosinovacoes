# Site institucional — Noryos Inovações

Fundação digital comercial da Noryos: gera conversa via WhatsApp, hospeda
o Diagnóstico Digital Noryos, e apresenta a metodologia Noryos OS. Ver
`../decisoes-site.md` pro briefing de posicionamento completo.

## Stack

- **Next.js 15.5** (App Router) + **TypeScript** + **Tailwind CSS v4**
  — fixado no 15.x de propósito; ver `AGENTS.md` / `DEPLOY-HOSTINGER.md`
  (o SWC do Next 16 exige glibc 2.29+, que a Hostinger não tem)
- **Zod** — validação do formulário de diagnóstico
- **@supabase/supabase-js** — persistência do diagnóstico (opcional nesta fase)
- **Resend** (via `fetch`, sem SDK) — notificação interna por e-mail de novo
  diagnóstico. Opcional nesta fase; ver "Notificação por e-mail" abaixo
- **Fontes** (`next/font/google`): Manrope (display) + Inter (corpo) + Geist Mono (rótulos/UI)
- Sem Framer Motion de propósito — motion system próprio em CSS + SVG + hooks
  (`lib/hooks.ts`: `useInView`, `useScrollProgress`, `useMouseParallax`, `useParallax`;
  `lib/motion.ts` + `components/ui/motion.tsx`: padrões nomeados, `Parallax`, `Stagger`)

## Como rodar

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # build de produção
npm run start     # servir o build
npm run lint      # ESLint
npm run typecheck # tsc --noEmit (o build já checa; útil pra rodar isolado)
npm run quality   # PORTÃO DE QUALIDADE: lint + build + E2E, nessa ordem
```

## Testes E2E (Playwright)

Segunda camada do Quality Gate (a primeira é `/revisar-site-noryos`).
Roda contra o **build de produção** (`next start`), num Chromium headless.
Não substitui inspeção visual humana — cobre regressão funcional.

```bash
npm run test:e2e          # exige um build antes (ou use npm run quality)
npm run test:e2e:headed   # com navegador visível
npm run test:e2e:ui       # modo interativo do Playwright
PW_DEV=1 npm run test:e2e # servidor em next dev em vez de next start
npx playwright install chromium   # 1ª vez / máquina nova
```

Cobertura (`e2e/`):

| Spec | O que garante |
|---|---|
| `home.spec.ts` | Home responde 200, Header/logo/CTA, âncoras, sem erro de JS nem 404 de asset |
| `navigation.spec.ts` | Menu desktop navega, CTA com href válido, menu mobile 390px, sem scroll horizontal |
| `sections.spec.ts` | Noryos OS troca a categoria; FAQ abre/fecha |
| `diagnostico.spec.ts` | Form renderiza/valida/percorre as 5 etapas/LGPD; envio real com e-mail **mockado** e `turnstileToken` injetado no POST → loading, sucesso, 1 registro, 1 e-mail; duplo clique não duplica; fluxo completo no mobile 390px sem scroll horizontal |
| `diagnostico-api.spec.ts` | Contrato de `POST /api/diagnostico`: 405/415/413/400, **Turnstile (token ausente/inválido → 403, válido → 200; checado antes do Zod)**, honeypot, envio rápido, e-mail inválido, URL inválida, sem consentimento, submissão válida (1 registro + 1 e-mail mock), dedupe, **rate limit 2 janelas: curta + longa, bloqueio + expiração + recuperação**. Spam nunca dispara e-mail |
| `routes.spec.ts` | 9 rotas → 200 + `<title>`/`<h1>`; `sitemap.xml`/`robots.txt`; 404 real |
| `metadata.spec.ts` | `<title>`/description/canonical/OG/Twitter no HTML final; ícones 200 + MIME; JSON-LD válido |
| `motion.spec.ts` | Depois do scroll o conteúdo aparece; interações funcionam; console limpo |
| `reduced-motion.spec.ts` | `prefers-reduced-motion` **não** esconde conteúdo (regressão do reveal) |
| `screenshots.spec.ts` | Evidência visual (Home desktop/mobile, Noryos OS, Diagnóstico) em `e2e/__evidence__/` (git-ignorado) |

Relatório HTML após a rodada: `npx playwright show-report`.

Regras pra manter a suíte estável (ver `e2e/helpers.ts`):
seletores por **role/label/texto**, nunca classe CSS volátil; sem `sleep`
arbitrário; `data-testid` só se não houver âncora semântica; se um teste
achar bug real, corrigir a aplicação — não afrouxar o teste.

## Arquitetura

```
src/
  app/                    # rotas (App Router)
    page.tsx              # Home
    solucoes/              # visão geral + 3 landing pages de solução
    sobre/, contato/, diagnostico/, politica-de-privacidade/
    layout.tsx             # fontes, header/footer, JSON-LD global
    sitemap.ts, robots.ts
  components/              # componentes de UI e seções reutilizáveis
    ui/                      # primitivos (Button, Icon, SpotlightCard, motion, ...)
    system/                  # visuais próprios (SystemCanvas, SystemFlow, FragmentGrid, ...)
  content/                 # dados (serviços, FAQ, Noryos OS, navegação, home) —
                            # separados de componente, editar aqui não em JSX
  lib/
    config.ts               # branding, WhatsApp, e-mail, URLs — config central
    seo.ts                   # helpers de metadata/structured data (JSON-LD)
    supabase.ts              # client do Supabase (condicional)
    hooks.ts                 # hooks de motion (inView, scrollProgress, parallax, spotlight)
    motion.ts                # tokens/helpers do motion system (stagger, delays)
```

## Como alterar o WhatsApp

Edite `NEXT_PUBLIC_WHATSAPP_NUMBER` no `.env.local` (formato E.164 sem
símbolos, ex: `5511999999999`). Nenhum componente tem número
"hardcoded" — todos usam `getWhatsappLink()` de `src/lib/config.ts`.
Enquanto a variável estiver vazia, os CTAs caem em fallback de e-mail.

## Como trocar logo e favicon

- **Logo:** `Header.tsx` e `Footer.tsx` renderizam a assinatura oficial
  via `<Image>` do `next/image` apontando pra `public/noryos-logo.png`
  (símbolo em `public/noryos-icon.png`). Pra trocar, substitua o arquivo
  em `public/` mantendo o nome; ajuste `width/height` no `<Image>` se a
  proporção mudar. Ver `../identidade/design-guide.md` → "Logo".
- **Favicon:** metadata file-based do App Router — `src/app/favicon.ico`
  + `src/app/icon.png` + `src/app/apple-icon.png`. Regenerar a partir do
  símbolo com `node scripts/gen-favicon.mjs` (lê `public/noryos-icon.png`).

## Como configurar o Supabase (Diagnóstico)

1. Criar um projeto em [supabase.com](https://supabase.com)
2. Rodar **todo** o SQL de referência (comentário no topo de
   `src/lib/supabase.ts`): tabela `diagnosticos` **+** tabela/função
   `diagnostico_check_rate_limit` (rate limit compartilhado).
3. Preencher no `.env.local`:
   ```
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
4. **Produção sem Supabase** → `POST /api/diagnostico` responde **503
   controlado** (`{ ok:false }`, sem stack trace) e **não grava em disco**.
   A falha de persistência não é mascarada.
5. **Dev/teste sem Supabase** (`NODE_ENV !== "production"`, ou
   `DIAGNOSTIC_ALLOW_FILE_FALLBACK=1`) → persiste num **fallback local**
   (`.data/diagnostico.local.jsonl`, git-ignorado), com WARN a cada
   gravação identificando que é fallback. Nunca é armazenamento de produção.

## Fluxo do Diagnóstico (endpoint `POST /api/diagnostico`)

`src/components/DiagnosticoForm.tsx` → `fetch` → `src/app/api/diagnostico/route.ts`.

Pipeline no servidor, nesta ordem: método (só POST, senão 405) →
Content-Type `application/json` (senão 415) → limite de payload 16 KB
(senão 413) → JSON válido (senão 400) → honeypot (`website`) → tempo
mínimo de preenchimento (2,5 s desde a montagem do form) → **rate limit
por origem (2 janelas)** → **Cloudflare Turnstile** (obrigatório,
server-side; senão 403) → validação Zod (`src/app/diagnostico/schema.ts`;
inclui checagem leniente de URL em `site`/`googleBusiness`) → sanitização →
deduplicação (mesma empresa+WhatsApp+e-mail em 2 min devolve o mesmo `id`,
sem novo registro nem novo e-mail) → **persistência**
(`src/lib/diagnostico-store.ts`) → **só então** notificação por e-mail
(`src/lib/email.ts`). Turnstile é checado **antes** de qualquer
persistência/e-mail: falha = 403, nada gravado, nada enviado.

**Rate limit** (`src/lib/rate-limit.ts`) — **duas janelas fixas por
origem**, ambas checadas a cada envio; a primeira que estourar devolve 429:
- **curta** — default **3 envios / 15 min** (`DIAGNOSTIC_RATELIMIT_SHORT_MAX`
  / `DIAGNOSTIC_RATELIMIT_SHORT_WINDOW_MS`)
- **longa** — default **10 envios / 24 h** (`DIAGNOSTIC_RATELIMIT_LONG_MAX`
  / `DIAGNOSTIC_RATELIMIT_LONG_WINDOW_MS`)
- **Supabase** (`diagnostico_check_rate_limit` RPC, atômico por linha) quando
  configurado — **compartilhado entre instâncias e sobrevive a restart**. Alvo
  de produção. Cada janela é uma linha própria (`<chave>:15m`, `<chave>:24h`).
- **Fallback em memória do processo** quando o Supabase não está configurado
  ou a RPC falha; loga um WARN único de "rate limit degradado".
- Nomes legados `DIAGNOSTIC_RATELIMIT_MAX` / `_WINDOW_MS` ainda funcionam como
  fallback só da janela curta.

**Cloudflare Turnstile** (`src/lib/turnstile.ts`) — anti-bot do formulário:
- Site key **público** em `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (só o frontend;
  lido no Server Component `diagnostico/page.tsx` e repassado ao form).
- Secret **server-only** em `TURNSTILE_SECRET_KEY` — **nunca `NEXT_PUBLIC_`**.
  O endpoint valida o token contra a API `siteverify` da Cloudflare.
- Sem token válido → **403**, sem persistir e sem e-mail.
- Sem `TURNSTILE_SECRET_KEY` em **produção** → 403 (falha fechado). Em
  dev/teste sem a secret → checagem **pulada** com WARN.
- `TURNSTILE_MODE=mock` (só dev/teste, ex. suíte E2E): resultado vem do
  próprio token, sem rede.

Honeypot / envio rápido demais respondem `{ ok: true }` sem persistir e
sem notificar. Se o e-mail falhar depois do lead salvo, a resposta
continua 200 (`email: "error"`), o registro é preservado para reenvio e
um warning seguro (sem PII, sem stack trace, sem secret) vai pro log.

## Notificação por e-mail do Diagnóstico

Destinatário: **exclusivamente** `DIAGNOSTIC_NOTIFICATION_EMAIL`
(server-side — nunca `NEXT_PUBLIC_`). O visitante nunca escolhe o
destinatário. Sem essa variável, o diagnóstico é salvo normalmente e
nenhum e-mail é enviado (log de warning).

Provedores (`DIAGNOSTIC_EMAIL_PROVIDER`):
- `resend` (default) — `fetch` puro, sem SDK. Trocar de provedor real é
  reescrever só `sendViaProvider()` em `src/lib/email.ts`.
- `mock` — grava o e-mail em `.data/diagnostico.email-mock.jsonl` em vez de
  enviar. Só dev/teste (a suíte E2E usa isso — nenhum e-mail real por
  execução automatizada). Bloqueado em produção sem
  `DIAGNOSTIC_ALLOW_FILE_FALLBACK=1`.

Status possíveis no corpo da resposta (`email`): `sent` (provedor aceitou a
requisição — **não** significa entregue na caixa), `skipped` (sem
destinatário ou sem credencial), `error` (provedor recusou / inacessível —
lead preservado).

Para ativar:

1. Criar conta em [resend.com](https://resend.com) e gerar uma API key
   (Settings → API Keys).
2. Preencher no `.env.local` / nas Environment variables da Hostinger:
   ```
   DIAGNOSTIC_NOTIFICATION_EMAIL=rafaviriato@hotmail.com   # fase de teste
   RESEND_API_KEY=re_...                                    # secret
   DIAGNOSTIC_NOTIFICATION_FROM=diagnostico@noryosinovacoes.com.br
   ```
3. Para o `FROM` funcionar num domínio próprio, verificar
   `noryosinovacoes.com.br` no painel do Resend (DNS). Sem domínio
   verificado, o Resend só entrega a partir de `onboarding@resend.dev` —
   deixe `DIAGNOSTIC_NOTIFICATION_FROM` vazio para usar esse remetente de
   teste.

### Checagem real controlada (uma vez, manual — não vai pra suíte)

A suíte E2E **nunca** dispara e-mail real (provedor `mock`). Para validar a
integração real com o Resend, uma vez:

```bash
# .env.local com RESEND_API_KEY + DIAGNOSTIC_NOTIFICATION_EMAIL reais
npm run build && npm run start          # NÃO use provider=mock aqui
# noutro terminal, uma submissão de teste:
curl -i -X POST http://127.0.0.1:3000/api/diagnostico \
  -H 'Content-Type: application/json' \
  -d '{"nomeEmpresa":"TESTE NORYOS QA","responsavel":"Rafael","whatsapp":"5199...","email":"voce@exemplo.com","consentimento":true,"startedAt":0}'
```

`"email":"sent"` na resposta = **Resend aceitou a requisição**. Confirmar
entrega e recebimento na caixa é passo separado (olhar o dashboard do
Resend / a própria caixa). HTTP 200 do Resend **não** é prova de entrega.

## Como configurar analytics

Preencha no `.env.local`: `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_GTM_ID`,
`NEXT_PUBLIC_META_PIXEL_ID`. Nenhum ID de teste está hardcoded — os
scripts de analytics ainda **não estão injetados no layout** (ver
pendência no `decisoes-site.md`); quando for ativar, adicionar em
`src/app/layout.tsx` lendo de `src/lib/config.ts` (`analyticsConfig`).

Eventos já nomeados em `analyticsEvents` (`src/lib/config.ts`), prontos
pra disparar quando o analytics for plugado:
`clique_whatsapp`, `iniciar_diagnostico`, `enviar_diagnostico`,
`visualizar_solucao`, `contato`, `lead`.

## Como adicionar um novo serviço

Edite `src/content/servicos.ts` — a ordem do array é a hierarquia
comercial (não reordenar por estética). Se o serviço tiver landing page
própria, adicione a rota em `src/app/solucoes/<slug>/page.tsx` seguindo
o padrão de `sites/`, `automacoes/` ou `performance/` (usam o componente
compartilhado `src/components/SolutionPage.tsx` + dado em
`src/content/solucoes-detalhe.ts`).

## Como criar uma nova landing page de solução

1. Adicionar o conteúdo em `src/content/solucoes-detalhe.ts`
2. Criar `src/app/solucoes/<slug>/page.tsx` com `metadata` + `<SolutionPage data={...} />`
3. Adicionar a rota em `src/app/sitemap.ts`

## Como publicar

Alvo definido: **tudo na Hostinger** (plano Business → Web Apps / Node.js),
com deploy automático a cada `git push`. Passo a passo completo em
[`DEPLOY-HOSTINGER.md`](./DEPLOY-HOSTINGER.md).

Resumo: `next.config.ts` já está com `output: "standalone"`; conecta-se o
repo GitHub no hPanel apontando o root pra `projetos/Noryos-Inovacoes/site`,
preenchem-se as Environment variables lá, e o domínio
`noryosinovacoes.com.br` é anexado ao Web App (DNS interno da Hostinger).

Antes de publicar: preencher as variáveis reais na Hostinger, trocar
favicon, revisar `/sobre` (nome do responsável), rodar `npm run quality`
(lint + build + E2E) e `/revisar-site-noryos` (skill do MazyOS) como
checklist final.

## O que NÃO está pronto ainda (pendências reais)

- Número de WhatsApp comercial definitivo
- **Projeto Supabase real** — obrigatório pro Diagnóstico em produção
  (persistência real + rate limit compartilhado; sem ele o endpoint dá 503).
  Rodar os dois blocos de SQL de `src/lib/supabase.ts`.
- **`RESEND_API_KEY` + `DIAGNOSTIC_NOTIFICATION_EMAIL` reais** — sem eles o
  diagnóstico é salvo mas a notificação não sai. Fazer a checagem real
  controlada (acima) uma vez após configurar.
- **`NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` reais** —
  obrigatórios pro Diagnóstico em produção. Sem a secret, o endpoint responde
  403 (falha fechado) e o formulário não envia. Criar o widget em
  `dash.cloudflare.com` → Turnstile, adicionar o domínio, preencher as duas
  vars na Hostinger. Validar em produção: abrir `/diagnostico`, completar as 5
  etapas, confirmar que o widget aparece e o envio conclui.
- Dedupe de submissão ainda é em memória do processo — se o processo
  reiniciar entre dois cliques, pode gerar 2 registros. Endurecer com um
  índice único no Supabase (hash empresa+whatsapp+email por janela).
- IDs de analytics
- Deploy: código pronto (`output: standalone` + guia em `DEPLOY-HOSTINGER.md`);
  falta conectar o repo no hPanel, preencher as env vars e anexar o domínio
