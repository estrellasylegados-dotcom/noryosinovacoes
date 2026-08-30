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
| `diagnostico.spec.ts` | Formulário renderiza, valida obrigatórios, percorre as 5 etapas, LGPD — **sem enviar** (nada de lead falso; honeypot intocado) |
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

- **Logo:** hoje o header/footer renderizam um fallback tipográfico
  ("Noryos" + ponto ciano, fonte Manrope). Quando o logo existir, troque o bloco
  `<Link>` em `src/components/Header.tsx` e `Footer.tsx` por um
  `<Image>` do `next/image` apontando pro arquivo em `public/`.
- **Favicon:** substitua `src/app/favicon.ico` pelo arquivo definitivo
  (mesmo nome, mesmo formato).

## Como configurar o Supabase (Diagnóstico)

1. Criar um projeto em [supabase.com](https://supabase.com)
2. Rodar o SQL de referência (comentário no topo de `src/lib/supabase.ts`) pra criar a tabela `diagnosticos`
3. Preencher no `.env.local`:
   ```
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
4. Sem essas variáveis, o formulário continua funcionando (valida e confirma pro usuário) mas não persiste — só loga um aviso no servidor, sem dado pessoal.

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
- Projeto Supabase real
- Logo e favicon definitivos
- IDs de analytics
- Deploy: código pronto (`output: standalone` + guia em `DEPLOY-HOSTINGER.md`);
  falta conectar o repo no hPanel, preencher as env vars e anexar o domínio
