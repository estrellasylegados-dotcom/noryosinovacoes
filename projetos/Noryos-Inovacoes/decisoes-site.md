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

- CTA principal: "Conversar sobre meu projeto" → WhatsApp, centralizado em `site/src/lib/config.ts` (`NEXT_PUBLIC_WHATSAPP_NUMBER`, ainda vazio — cai em fallback de e-mail até ser definido).
- CTAs secundários: "Conhecer as soluções", "Solicitar diagnóstico".
- Evitar CTA genérico ("saiba mais", "clique aqui", "entre em contato") — não usados no site.

## Diagnóstico Digital Noryos

- Página `/diagnostico`, formulário em 5 etapas, sem exigir conta.
- Não promete resultado automático nem score nesta primeira versão (análise manual/semiautomática).
- Persistência via Supabase preparada (`site/src/lib/supabase.ts`), mas **sem projeto configurado ainda** — formulário funciona e confirma recebimento mesmo sem Supabase ativo.
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

- Número de WhatsApp comercial definitivo
- Projeto Supabase real (URL + service role key) pra persistir os diagnósticos
- IDs de GA4 / GTM / Meta Pixel
- Confirmação do nome usado em `/sobre` (assumi "Rafael Viriato" a partir do ambiente do projeto — confirmar se está correto antes de publicar)
- Deploy (Vercel, Hostinger ou outro) e apontamento do domínio noryosinovacoes.com.br
