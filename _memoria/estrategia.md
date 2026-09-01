# Estratégia

> O que importa agora. Prioridades, metas, prazos.
> O Claude usa isso pra decidir o que sugerir primeiro e o que adiar.
> Atualize sempre que as prioridades mudarem.

## Fase

Pós-lançamento da Noryos Inovações — o site institucional está no ar em https://noryosinovacoes.com.br (deploy Hostinger Web Apps, automático a partir do `main`). Construído e testado (build + lint verdes). Em 28/08/2026 passou por um redesign profundo da camada visual ("Digital Operating System": novo hero, tipografia, motion system, cards, Noryos OS Explorer, diagnóstico visual) — estratégia, SEO e arquitetura preservados. Em 29/08/2026: auditoria + ajuste do motion system (reveals agora perceptíveis no scroll — o gatilho disparava no rodapé) e logo/favicon/Open Graph oficiais plugados. Segundo passe no mesmo dia: presença da logo no header (28→52px no desktop) + favicon robusto (`favicon.ico` 16/32/48, `icon.png` 512, `apple-icon` 180, gerados de `noryos-icon.png`). Terceiro passe (29/08/2026): `noryos-logo.png` trocado pela 2ª entrega oficial do wordmark e Header desktop passou a travar a largura em 170px (testados 160/170/180) — commit `66ec398`. Em 29–30/08/2026: instalada a 2ª camada do Quality Gate — suíte Playwright E2E no `site/` (`npm run quality` = lint + build + E2E; roda contra o build de produção). Em 30–31/08/2026: teste de conceito completo do endpoint do Diagnóstico Digital — `POST /api/diagnostico` (route handler no lugar da Server Action) com pipeline anti-spam (honeypot, tempo mínimo, rate limit, limites de payload/método/Content-Type, dedupe), persistência antes da notificação, e notificação interna por e-mail via Resend (`fetch`, sem SDK; provider `mock` pros testes). Rate limit agora tem backend compartilhado via Supabase RPC (fallback em memória) e o fallback local de persistência foi desligado em produção (503 controlado, sem gravar em disco). Suíte E2E subiu pra 52 testes. Commitado como trabalho em andamento. Em 01/09/2026: projeto Supabase real criado (tabelas `diagnosticos` + `diagnostico_rate_limit` + RPC `diagnostico_check_rate_limit` rodadas via SQL, confirmadas por SSH), env vars Supabase e Resend configuradas na Hostinger (key do Supabase no formato novo `sb_secret_…`), domínio `noryosinovacoes.com.br` verificado no Resend, e deploy de produção concluído. **Porém `POST /api/diagnostico` ainda responde 503 em produção** — a persistência falha e a causa raiz da conexão backend↔Supabase está sob investigação (não é mais "criar o projeto"). Instrumentação de log publicada (commit `97de1b4`: logs estruturados `supabase_insert_failed` / `supabase_client_absent` / `rate_limit_degraded` + `site/scripts/supabase-doctor.mjs`), aguardando deploy na Hostinger pra revelar a causa. **Quality Gate ainda REPROVADO** — até validar persistência + e-mail reais end-to-end. Fase agora é destravar o 503 e as pendências abaixo antes de prospecção ativa.

## Prioridade principal

**Destravar o 503 do `/api/diagnostico` em produção.** Supabase (projeto + SQL) e Resend (key + domínio) já estão configurados na Hostinger, mas o endpoint ainda dá 503 — a persistência no Supabase falha e a causa raiz da conexão está sob investigação (key nova `sb_secret_…`, instrumentação de log no commit `97de1b4` aguardando deploy). Depois: validar persistência + e-mail reais end-to-end e fechar o Quality Gate. Pendências humanas que restam: setar `NEXT_PUBLIC_WHATSAPP_NUMBER=5561999256901` na env de produção da Hostinger + redeploy (o número já está definido e no `.env.local`), e IDs de analytics (GA4/GTM/Meta Pixel). (Logo/favicon: feitos em 29/08/2026 — três passes, incluindo a troca do wordmark e o ajuste de tamanho no header.)

## Pendência de deploy — cache de CDN

O que está no ar em noryosinovacoes.com.br fica **atrás do cache da CDN da Hostinger**, que segura o HTML com TTL de 1 ano. "Deploy automático a partir do `main`" não basta: cada versão nova exige **redeploy + purge manual de CDN no hPanel** pra aparecer. Já corrigido no código (`next.config.mjs` → `Cache-Control` curto pra documento HTML, commit `3eacc36`), mas ainda falta **um** purge pra descartar o HTML antigo já cacheado — e, idealmente, configurar a CDN da Hostinger pra não cachear HTML.

## O que pode esperar

- Nicho odontologia (ainda não confirmado)
- CRM completo / integração com n8n
- Blog e páginas de conteúdo SEO
- Redes sociais e ads da própria Noryos (o site vem primeiro, por decisão do usuário)

## Contexto com prazo

Nenhum prazo definido ainda pelo usuário.
