# Estratégia

> O que importa agora. Prioridades, metas, prazos.
> O Claude usa isso pra decidir o que sugerir primeiro e o que adiar.
> Atualize sempre que as prioridades mudarem.

## Fase

Pós-lançamento da Noryos Inovações — o site institucional está no ar em https://noryosinovacoes.com.br (deploy Hostinger Web Apps, automático a partir do `main`). Construído e testado (build + lint verdes). Em 28/08/2026 passou por um redesign profundo da camada visual ("Digital Operating System": novo hero, tipografia, motion system, cards, Noryos OS Explorer, diagnóstico visual) — estratégia, SEO e arquitetura preservados. Em 29/08/2026: auditoria + ajuste do motion system (reveals agora perceptíveis no scroll — o gatilho disparava no rodapé) e logo/favicon/Open Graph oficiais plugados. Segundo passe no mesmo dia: presença da logo no header (28→52px no desktop) + favicon robusto (`favicon.ico` 16/32/48, `icon.png` 512, `apple-icon` 180, gerados de `noryos-icon.png`). Terceiro passe (29/08/2026): `noryos-logo.png` trocado pela 2ª entrega oficial do wordmark e Header desktop passou a travar a largura em 170px (testados 160/170/180) — commit `66ec398`. Em 29–30/08/2026: instalada a 2ª camada do Quality Gate — suíte Playwright E2E no `site/` (`npm run quality` = lint + build + E2E; 36 testes; roda contra o build de produção). Fase agora é iteração pós-lançamento; ainda falta destravar as pendências humanas abaixo antes de prospecção ativa.

## Prioridade principal

Finalizar as pendências humanas do site institucional (`projetos/Noryos-Inovacoes/site/`): número de WhatsApp definitivo, projeto Supabase real e IDs de analytics. (Logo/favicon: feitos em 29/08/2026 — três passes, incluindo a troca do wordmark e o ajuste de tamanho no header.)

## Pendência de deploy — cache de CDN

O que está no ar em noryosinovacoes.com.br fica **atrás do cache da CDN da Hostinger**, que segura o HTML com TTL de 1 ano. "Deploy automático a partir do `main`" não basta: cada versão nova exige **redeploy + purge manual de CDN no hPanel** pra aparecer. Já corrigido no código (`next.config.mjs` → `Cache-Control` curto pra documento HTML, commit `3eacc36`), mas ainda falta **um** purge pra descartar o HTML antigo já cacheado — e, idealmente, configurar a CDN da Hostinger pra não cachear HTML.

## O que pode esperar

- Nicho odontologia (ainda não confirmado)
- CRM completo / integração com n8n
- Blog e páginas de conteúdo SEO
- Redes sociais e ads da própria Noryos (o site vem primeiro, por decisão do usuário)

## Contexto com prazo

Nenhum prazo definido ainda pelo usuário.
