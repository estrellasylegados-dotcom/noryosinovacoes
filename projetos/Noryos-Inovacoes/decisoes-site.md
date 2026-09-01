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
- Não promete resultado automático nem score nesta primeira versão (análise manual/semiautomática).
- Envio via `POST /api/diagnostico` (route handler, `site/src/app/api/diagnostico/route.ts`). Pipeline: método → Content-Type → limite de payload → JSON válido → honeypot → tempo mínimo de preenchimento → rate limit por IP → validação Zod → sanitização → dedupe → **persistência (Supabase) → só então notificação por e-mail (Resend)**. Requisição classificada como spam não persiste e não dispara e-mail.
- Rate limit compartilhado via Supabase RPC (`diagnostico_check_rate_limit`), com fallback em memória do processo. Persistência: fallback local em arquivo é permitido só em dev/teste — em produção sem Supabase o endpoint responde **503 controlado** (não grava em disco, não mascara a falha).
- Notificação por e-mail (`site/src/lib/email.ts`): destinatário lido **só** de `DIAGNOSTIC_NOTIFICATION_EMAIL` (server-side, nunca do formulário); provedor Resend via `fetch` (provider `mock` grava arquivo nos testes E2E — nenhum e-mail real na suíte). Falha de e-mail depois do lead salvo não perde o lead (resposta 200, `email:"error"`, log seguro).
- **Estado (31/08/2026):** teste de conceito implementado e testado localmente (52 testes E2E verdes, anti-spam/rate limit/fallback validados) e commitado como trabalho em andamento; **Quality Gate ainda REPROVADO** — falta projeto Supabase real e API key do Resend pra confirmar persistência e envio reais.
- **Estado (01/09/2026):** projeto Supabase real criado (tabelas + RPC rodadas via SQL, confirmadas por SSH), env vars Supabase e Resend configuradas na Hostinger (key do Supabase no formato novo `sb_secret_…`), domínio verificado no Resend, deploy de produção concluído. **`POST /api/diagnostico` ainda responde 503 em produção** — persistência falhando, causa raiz da conexão backend↔Supabase sob investigação. Instrumentação de log publicada (commit `97de1b4`: `supabase_insert_failed` / `supabase_client_absent` / `rate_limit_degraded` + `site/scripts/supabase-doctor.mjs`), aguardando deploy pra revelar a causa. **Quality Gate segue REPROVADO** até validar persistência + e-mail reais end-to-end.
- Consentimento LGPD obrigatório no envio, com link pra `/politica-de-privacidade`.

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
- IDs de GA4 / GTM / Meta Pixel
- Confirmação do nome usado em `/sobre` (assumi "Rafael Viriato" a partir do ambiente do projeto — confirmar se está correto antes de publicar)
- Deploy e domínio: **feito** — deploy de produção na Hostinger Web Apps concluído, `noryosinovacoes.com.br` no ar (deploy automático a partir do `main`; ainda exige purge manual de CDN no hPanel a cada versão)
