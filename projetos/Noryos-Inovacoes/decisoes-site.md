# Decisões — Site institucional Noryos Inovações

> Registro das decisões do briefing mestre de 27/08/2026 (site v2, Next.js).
> Ver também `identidade/design-guide.md` (visual) e `site/README.md` (técnico).

## Posicionamento

- A Noryos **não** deve parecer agência de marketing tradicional — deve parecer empresa de soluções digitais e tecnologia (presença digital + aquisição + automação + conteúdo).
- Percepção-alvo: tecnológica e premium, corporativa e confiável, moderna e ousada. Evitar "é só mais uma agência que faz post pro Instagram".
- Público inicial amplo: pequenos negócios, empresas locais, profissionais liberais, prestadores de serviço, e-commerce, PMEs em geral — **não nichar agora**.
- Possível vertical futura: odontologia. Arquitetura preparada (`/segmentos/*` pode ser criado depois), site atual **não** é de nicho.
- Estratégia de aquisição inicial pode incluir prospecção ativa via Google Business Profile (empresas sem site, site ruim, sem mobile, baixa conversão).

## Hierarquia de serviços (prioridade comercial, não estética)

1. Presença Digital (sites, landing pages, páginas comerciais, mobile, conversão)
2. Automação (atendimento, integrações, fluxos, WhatsApp, CRM futuro, IA quando fizer sentido)
3. Aquisição e Performance (Google/Meta Ads, tracking, otimização) — **não** chamar de "tráfego pago" como conceito de posicionamento
4. Conteúdo e Presença (planejamento, criativos, redes sociais — redes sociais não é protagonista)

## Noryos OS

- Nome público da metodologia. **Nunca** expõe a estrutura real interna do `noryosinovacoes_OS` (`_memoria`, `scripts`, `skills`, prompts, templates).
- Camadas conceituais: **interno** (`noryosinovacoes_OS` — propriedade da Noryos) vs. **cliente** (estrutura própria e simplificada por projeto).
- Categorias públicas do Noryos OS (ver `site/src/content/noryos-os.ts`): Presença Digital, Aquisição, Conteúdo, Automações, Dados, Documentação, Evolução.

## CTA e conversão

- CTA principal: "Conversar sobre meu projeto" → WhatsApp, centralizado em `site/src/lib/config.ts` (`NEXT_PUBLIC_WHATSAPP_NUMBER`). Número definido (01/09/2026): `5561999256901` — `(61) 99925-6901`. Aplicado no `.env.local` e validado no build local (`wa.me/5561999256901` renderiza). Falta setar a env var na produção da Hostinger + redeploy (`NEXT_PUBLIC_` é build-time); até lá, produção segue no fallback de e-mail.
- CTAs secundários: "Conhecer as soluções", "Solicitar diagnóstico".
- Evitar CTA genérico ("saiba mais", "clique aqui", "entre em contato") — não usados no site.

## Diagnóstico Digital Noryos

- Página `/diagnostico`, formulário em 5 etapas, sem exigir conta.
- **Não mostra resultado automático nem score ao visitante** — a tela de sucesso é a mesma pra todos. Desde 02/09/2026 o backend calcula uma **qualificação comercial automática** (scoring V1, interno — ver subseção "Qualificação comercial automática (scoring V1)" abaixo).
- Envio via `POST /api/diagnostico` (route handler, `site/src/app/api/diagnostico/route.ts`). Pipeline: método → Content-Type → limite de payload → JSON válido → honeypot → tempo mínimo de preenchimento → rate limit por origem (2 janelas) → **Cloudflare Turnstile (obrigatório, server-side — token ausente/inválido → 403 sem persistir nem notificar)** → validação Zod → sanitização → dedupe → **scoring V1 (função pura, determinística, sem I/O)** → **persistência (Supabase) — lead + scoring numa única linha → só então notificação por e-mail (Resend), com o resumo comercial no topo**. Requisição classificada como spam não persiste e não dispara e-mail. Scoring roda **depois** do short-circuit de dedupe: duplicata devolve o resultado em cache e não é repontuada.
- Rate limit compartilhado via Supabase RPC (`diagnostico_check_rate_limit`), com fallback em memória do processo — **duas janelas fixas por origem**: curta (default 3 envios / 15 min) e longa (default 10 / 24 h); a primeira que estourar devolve 429. Mesma RPC/tabela, chaves distintas (`<chave>:15m`, `<chave>:24h`), sem mudança de SQL. Persistência: fallback local em arquivo é permitido só em dev/teste — em produção sem Supabase o endpoint responde **503 controlado** (não grava em disco, não mascara a falha).
- Anti-bot Cloudflare Turnstile (`site/src/lib/turnstile.ts`): site key **público** em `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (lido no Server Component `diagnostico/page.tsx` e repassado ao form); secret **só no servidor** em `TURNSTILE_SECRET_KEY` (nunca `NEXT_PUBLIC_`). Sem token válido → 403. Sem `TURNSTILE_SECRET_KEY` em produção → 403 (falha fechado); em dev/teste sem a secret → checagem pulada com WARN. `TURNSTILE_MODE=mock` só para dev/teste (suíte E2E).
- Notificação por e-mail (`site/src/lib/email.ts`): destinatário lido **só** de `DIAGNOSTIC_NOTIFICATION_EMAIL` (server-side, nunca do formulário); provedor Resend via `fetch` (provider `mock` grava arquivo nos testes E2E — nenhum e-mail real na suíte). Falha de e-mail depois do lead salvo não perde o lead (resposta 200, `email:"error"`, log seguro).
- **Estado (31/08/2026):** teste de conceito implementado e testado localmente (52 testes E2E verdes, anti-spam/rate limit/fallback validados) e commitado como trabalho em andamento; **Quality Gate ainda REPROVADO** — falta projeto Supabase real e API key do Resend pra confirmar persistência e envio reais.
- **Estado (01/09/2026):** projeto Supabase real criado (tabelas + RPC rodadas via SQL, confirmadas por SSH), env vars Supabase e Resend configuradas na Hostinger (key do Supabase no formato novo `sb_secret_…`), domínio verificado no Resend, deploy de produção concluído. **`POST /api/diagnostico` ainda responde 503 em produção** — persistência falhando, causa raiz da conexão backend↔Supabase sob investigação. Instrumentação de log publicada (commit `97de1b4`: `supabase_insert_failed` / `supabase_client_absent` / `rate_limit_degraded` + `site/scripts/supabase-doctor.mjs`), aguardando deploy pra revelar a causa. **Quality Gate segue REPROVADO** até validar persistência + e-mail reais end-to-end.
- **Estado (02/09/2026):** Cloudflare Turnstile obrigatório server-side + rate limit em 2 janelas (3/15min + 10/24h) implementados. Novo `site/src/lib/turnstile.ts`; Turnstile checado antes de persistir/Resend (falha → 403). Testado localmente: `npm run quality` (lint + build + **57 E2E verdes**, incluindo token ausente/inválido → 403, válido → 200, ordem antes do Zod, janela curta e longa) + checagem do endpoint real com as chaves de teste da Cloudflare (pass → 200, fail/ausente → 403 sem persistir). Commitado (`32641cc`) e pushed pro `main`. **Falta validar em produção** com as chaves reais do Turnstile na Hostinger. Não afeta o 503 (independente).
- Consentimento LGPD obrigatório no envio, com link pra `/politica-de-privacidade`.

### Qualificação comercial automática (scoring V1)

Decisão estrutural (02/09/2026). `site/src/lib/diagnostico-scoring.ts` — módulo puro, **determinístico e auditável, sem IA**. `scoreDiagnostico(dados validados)` devolve:

- **`maturidadeDigital`** (0–100, alto = mais estruturado): site 35 · Google Business 20 · Instagram/redes 15 · estrutura de aquisição 20 · atendimento 10.
- **`potencialComercial`** (0–100, alto = melhor oportunidade → coluna `score`): gaps que a Noryos resolve 35 · dor/problema claro 20 · objetivo de crescimento 25 · urgência 10 · aderência aos serviços Noryos 10. **Completude de contato NÃO entra no score** (fica em `qualidadeContato`, informativo).
- **`classificacao`**: `baixa_prioridade` (0–29) · `oportunidade_fria` (30–49) · `boa_oportunidade` (50–69) · `oportunidade_quente` (70–84) · `prioridade_comercial` (85–100).
- **`prioridade`**: `baixa` · `media` · `alta` · `critica` (`critica` só em 85+ com urgência ou gaps≥30).
- **`gaps`** (só com evidência — `site_possivelmente_defasado` exige relato textual explícito, o formulário não pergunta qualidade do site), **`servicosRecomendados`** (só entre Presença Digital / Automações / Aquisição e Performance / Conteúdo / Redes Sociais; ordem pela hierarquia comercial; **máx 3**; nunca todos por padrão), **`proximaAcao`**, **`criterios`** (auditoria sem PII do lead).
- **`scoring_version`** (`"v1"`) obrigatório e persistido — recalibrar pesos/léxicos = mudar as constantes no topo do módulo + bump da versão; diagnósticos antigos guardam a versão com que foram pontuados.

Persistência: colunas `score` · `maturidade_digital` · `classificacao` · `prioridade` · `scoring_version` · `resultado` (jsonb com o objeto completo) — migração **aditiva e não-destrutiva** (SQL no topo de `site/src/lib/supabase.ts`; linhas pré-v1 ficam `NULL`). E-mail interno abre com o resumo comercial e só depois os dados crus; subject só ganha realce `🔥 NN/100 — …` em `prioridade_comercial` (85+).

Léxico é V1 e vai errar em texto ambíguo — por isso os pesos e as listas de palavras estão isolados no topo do módulo. Cobertura: 16 testes unitários (`site/e2e/diagnostico-scoring.spec.ts`) + 5 de contrato no endpoint. **Estado: VALIDADO LOCALMENTE** (`npm run quality`, 78 E2E verdes) — **não** VALIDADO EM PRODUÇÃO (depende do 503 resolvido + `alter table` no Supabase real + 1 envio real conferido).

## Regra de credibilidade (crítica)

- **Nunca** criar cliente fictício, depoimento falso, número inventado, logo falso ou selo/premiação inexistente.
- Permitido: cenário demonstrativo/hipotético, claramente rotulado como tal (usado na Home e nas páginas de solução).
- Credibilidade construída via metodologia, transparência e execução — não prova social.

## Linguagem

- Mistura institucional ("A Noryos desenvolve...") com primeira pessoa do plural em trechos mais humanos ("Entendemos primeiro..."). Nunca 100% um ou outro.
- Proibido: "revolucionamos seu negócio", "soluções 360", "agência completa", "somos apaixonados pelo que fazemos", texto vazio típico de IA.

## Stack e arquitetura

- Next.js (App Router) + TypeScript + Tailwind CSS v4, sem Framer Motion — motion system próprio (CSS + SVG + hooks de `IntersectionObserver`/rAF), decisão de manter dependências enxutas mantida no redesign.
- **Redesign "Digital Operating System" (28/08/2026):** camada de experiência refeita — hero com sistema vivo (`SystemCanvas`), tipografia Manrope + Inter + Geist Mono, motion system nomeado, cards com spotlight, Noryos OS Explorer como janela de software, Diagnóstico como ferramenta visual, timelines e parallax de scroll. Estratégia, arquitetura de informação e SEO preservados. Ver `identidade/design-guide.md` (atualizado).
- App vive em `projetos/Noryos-Inovacoes/site/` (projeto Next.js isolado, `node_modules` já coberto pelo `.gitignore` raiz).
- Protótipo estático anterior (one-page, direção "Grafite + Esmeralda") arquivado em `projetos/Noryos-Inovacoes/sites/prototipo-v1-onepage.html` — não apagado, substituído como ativo principal.
- SEO técnico: metadata por página, `sitemap.ts`, `robots.ts`, Open Graph, JSON-LD (Organization, WebSite, Service, BreadcrumbList, FAQPage).

## Pendências reais (não bloqueiam a entrega, mas precisam de ação humana)

- Número de WhatsApp comercial: **definido** (01/09/2026) — `5561999256901` / `(61) 99925-6901`, já no `.env.local`. Falta setar a env var `NEXT_PUBLIC_WHATSAPP_NUMBER` na produção da Hostinger + redeploy (é build-time)
- Projeto Supabase: **criado** — tabelas `diagnosticos` + `diagnostico_rate_limit` + RPC rodadas via SQL (confirmadas por SSH), `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (formato novo `sb_secret_…`) na Hostinger. **Mas `/api/diagnostico` ainda dá 503 em produção** — causa raiz da conexão sob investigação (ver "Estado (01/09/2026)" acima), não é mais tarefa de setup
- Resend: `RESEND_API_KEY` + `DIAGNOSTIC_NOTIFICATION_EMAIL` (fase de teste: rafaviriato@hotmail.com) + `DIAGNOSTIC_NOTIFICATION_FROM` **configurados** na Hostinger, domínio `noryosinovacoes.com.br` **verificado** no Resend. Falta a checagem real controlada (ver `site/README.md`) — bloqueada pelo 503 (e-mail só dispara depois da persistência)
- Cloudflare Turnstile: criar o widget em `dash.cloudflare.com` → Turnstile, adicionar o domínio `noryosinovacoes.com.br`, e setar `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (público) + `TURNSTILE_SECRET_KEY` (secreta) nas env vars da Hostinger. **Sem a secret o `/api/diagnostico` responde 403** (falha fechado) e o formulário não envia. Validar em produção depois: abrir `/diagnostico`, completar as 5 etapas, confirmar que o widget aparece e o envio conclui
- Scoring V1 do Diagnóstico: rodar o bloco `alter table … add column if not exists` (topo de `site/src/lib/supabase.ts`) no Supabase real — colunas `maturidade_digital` / `classificacao` / `prioridade` / `scoring_version` (aditivo, não-destrutivo). Depois do 503 resolvido, fazer 1 envio real e conferir a linha (`score` / `maturidade_digital` / `resultado` preenchidos) + o e-mail interno com o resumo comercial. Só então marcar como VALIDADO EM PRODUÇÃO
- IDs de GA4 / GTM / Meta Pixel
- Confirmação do nome usado em `/sobre` (assumi "Rafael Viriato" a partir do ambiente do projeto — confirmar se está correto antes de publicar)
- Deploy e domínio: **feito** — deploy de produção na Hostinger Web Apps concluído, `noryosinovacoes.com.br` no ar (deploy automático a partir do `main`; ainda exige purge manual de CDN no hPanel a cada versão)
