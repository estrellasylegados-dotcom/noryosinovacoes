# Estratégia

> O que importa agora. Prioridades, metas, prazos.
> O Claude usa isso pra decidir o que sugerir primeiro e o que adiar.
> Atualize sempre que as prioridades mudarem.

## Fase

Pós-lançamento da Noryos Inovações — o site institucional está no ar em https://noryosinovacoes.com.br (deploy Hostinger Web Apps, automático a partir do `main`). Construído e testado (build + lint verdes). Em 28/08/2026 passou por um redesign profundo da camada visual ("Digital Operating System": novo hero, tipografia, motion system, cards, Noryos OS Explorer, diagnóstico visual) — estratégia, SEO e arquitetura preservados. Em 29/08/2026: auditoria + ajuste do motion system (reveals agora perceptíveis no scroll — o gatilho disparava no rodapé) e logo/favicon/Open Graph oficiais plugados. Segundo passe no mesmo dia: presença da logo no header (28→52px no desktop) + favicon robusto (`favicon.ico` 16/32/48, `icon.png` 512, `apple-icon` 180, gerados de `noryos-icon.png`). Terceiro passe (29/08/2026): `noryos-logo.png` trocado pela 2ª entrega oficial do wordmark e Header desktop passou a travar a largura em 170px (testados 160/170/180) — commit `66ec398`. Em 29–30/08/2026: instalada a 2ª camada do Quality Gate — suíte Playwright E2E no `site/` (`npm run quality` = lint + build + E2E; roda contra o build de produção). Em 30–31/08/2026: teste de conceito completo do endpoint do Diagnóstico Digital — `POST /api/diagnostico` (route handler no lugar da Server Action) com pipeline anti-spam (honeypot, tempo mínimo, rate limit, limites de payload/método/Content-Type, dedupe), persistência antes da notificação, e notificação interna por e-mail via Resend (`fetch`, sem SDK; provider `mock` pros testes). Rate limit agora tem backend compartilhado via Supabase RPC (fallback em memória) e o fallback local de persistência foi desligado em produção (503 controlado, sem gravar em disco). Suíte E2E subiu pra 52 testes. Commitado como trabalho em andamento. Em 01/09/2026: projeto Supabase real criado (tabelas `diagnosticos` + `diagnostico_rate_limit` + RPC `diagnostico_check_rate_limit` rodadas via SQL, confirmadas por SSH), env vars Supabase e Resend configuradas na Hostinger (key do Supabase no formato novo `sb_secret_…`), domínio `noryosinovacoes.com.br` verificado no Resend, e deploy de produção concluído. **Porém `POST /api/diagnostico` ainda responde 503 em produção** — a persistência falha e a causa raiz da conexão backend↔Supabase está sob investigação (não é mais "criar o projeto"). Instrumentação de log publicada (commit `97de1b4`: logs estruturados `supabase_insert_failed` / `supabase_client_absent` / `rate_limit_degraded` + `site/scripts/supabase-doctor.mjs`), aguardando deploy na Hostinger pra revelar a causa. Em 02/09/2026: Cloudflare Turnstile obrigatório server-side no `POST /api/diagnostico` (validação via `siteverify` antes de persistir/notificar; token ausente/inválido → 403 sem gravar nem enviar e-mail; secret só no servidor, site key público via prop do Server Component) e rate limit passou a ter **duas janelas fixas por origem** (3 envios / 15 min + 10 / 24 h, mesma RPC/tabela Supabase). Testado localmente e commitado (`32641cc`). **Ainda em 02/09/2026: 503 resolvido + Diagnóstico Digital V2 com scoring comercial V1** — `site/src/lib/diagnostico-scoring.ts`, qualificação determinística sem IA: maturidade digital e potencial comercial (0–100), classificação por faixa, prioridade, gaps, serviços Noryos recomendados, próxima ação; `scoring_version = "v1"`; colunas novas (`maturidade_digital` / `classificacao` / `prioridade` / `scoring_version` + índices) via migração aditiva já aplicada no Supabase de produção. **Validado ponta a ponta em produção** (commits `219c35c` + `0bbff35`): envio real com linha completa no Supabase, e-mail interno com resumo comercial (subject neutro <85), teste negativo (POST sem Turnstile → 403, nada gravado). Suíte E2E em **78 testes**. **Quality Gate: APROVADO — VALIDADO EM PRODUÇÃO.** Em 03/09/2026: **Formulário V2 do Diagnóstico** — coleta estruturada (chips/cards) no lugar de texto livre, **sem recalibrar o scoring** (`scoring_version` segue `"v1"`; `form_version = "v2"`); ponte pura `composeLegacyText` (Form V2 → scoring V1, `site/src/lib/diagnostico-compose.ts`); decisão U1 (`prazo` alimenta a urgência do V1 via a composição); colunas aditivas no Supabase (`form_version` / `respostas` jsonb / `prazo` / `objetivo_principal` / `porte`, migração `site/supabase/migrations/2026-09-03_diagnostico_form_v2.sql`); e-mail com bloco "Respostas do lead (estruturado)"; funil do formulário instrumentado (`site/src/lib/analytics.ts` + `<Analytics/>` guardado por env — **sem PII**). Investimento ficou **fora** desta versão; objetivo principal e prazo são **obrigatórios**; porte é **opcional**. Commit `376a8c6`. Suíte E2E em **108 testes**. **Quality Gate local: APROVADO — VALIDADO LOCALMENTE** (lint + build + 108 E2E contra o build de produção). **NÃO validado em produção** — falta migração + deploy + preenchimento real.

## Prioridade principal

**Concluir a validação em produção do Formulário V2 do Diagnóstico Digital** (commit `376a8c6`, hoje **VALIDADO LOCALMENTE** — não marcar VALIDADO EM PRODUÇÃO antes de terminar a lista):

1. Aplicar a migration aditiva no Supabase (`site/supabase/migrations/2026-09-03_diagnostico_form_v2.sql`).
2. Validar o deploy do commit `376a8c6` na Hostinger.
3. Executar o purge do CDN no hPanel.
4. Fazer **1 preenchimento real** em `noryosinovacoes.com.br/diagnostico`.
5. Conferir na linha do Supabase: `form_version='v2'`, `respostas` jsonb, `prazo`, `objetivo_principal`, `porte`, `score` e `scoring_version='v1'`.
6. Validar o novo bloco "Respostas do lead (estruturado)" no e-mail interno.
7. Confirmar de novo a proteção do Turnstile (POST sem token → 403, nada gravado).
8. Depois disso: **iniciar a coleta de leads reais** para (a) medir conversão e drop-off por etapa do formulário (funil já instrumentado no `dataLayer`) e (b) acumular base para calibrar um scoring futuro. **Observar dados reais antes de criar um scoring v2** — o V1 continua preservado.

Registros permanentes desta versão: scoring V1 **preservado** · `form_version = v2` · `scoring_version = v1` · investimento **fora** do formulário · prazo e objetivo principal **obrigatórios** · porte **opcional** · analytics do funil implementado **sem PII** · GTM/GA em produção ainda **opcional/pendente** (setar `NEXT_PUBLIC_GTM_ID` na Hostinger + redeploy; até lá os eventos ficam só no `window.dataLayer`).

Pendências humanas menores que seguem: setar `NEXT_PUBLIC_WHATSAPP_NUMBER=5561999256901` na env de produção da Hostinger + redeploy (o número já está no `.env.local`; até lá os CTAs caem no fallback de e-mail) e configurar a CDN da Hostinger pra não cachear HTML (hoje exige purge manual a cada deploy). (Logo/favicon: feitos em 29/08/2026.)

## Pendência de deploy — cache de CDN

O que está no ar em noryosinovacoes.com.br fica **atrás do cache da CDN da Hostinger**, que segura o HTML com TTL de 1 ano. "Deploy automático a partir do `main`" não basta: cada versão nova exige **redeploy + purge manual de CDN no hPanel** pra aparecer (feito nos deploys de 01–02/09/2026, incluindo a validação em produção do Diagnóstico). Já mitigado no código (`next.config.mjs` → `Cache-Control` curto pra documento HTML, commit `3eacc36`); o que ainda falta é **configurar a CDN da Hostinger pra não cachear HTML**, eliminando o purge manual a cada deploy.

## O que pode esperar

- Nicho odontologia (ainda não confirmado)
- CRM completo / integração com n8n
- Blog e páginas de conteúdo SEO
- Redes sociais e ads da própria Noryos (o site vem primeiro, por decisão do usuário)

## Contexto com prazo

Nenhum prazo definido ainda pelo usuário.
