# Empresa

> Memória central do negócio. O Claude lê esse arquivo antes de cada resposta.
> Preenchido pelo `/instalar` — você pode editar a qualquer momento.

**Nome:** Rafael Viriato *(assumido a partir do ambiente do projeto — confirmar)*
**Negócio:** Noryos Inovações (noryosinovacoes.com.br)
**O que faz:** Empresa de soluções digitais e tecnologia pra pequenas e médias empresas — presença digital (sites), automação, aquisição e performance (Ads), e conteúdo. Posicionamento explícito de NÃO parecer agência de marketing tradicional.
**Perfil:** Iniciativa pessoal / founder-led — Rafael é responsável direto pelos projetos, sem equipe ainda.
**Atende clientes:** Público amplo de PME no início (pequenos negócios, profissionais liberais, prestadores de serviço, e-commerce). Possível nicho futuro em odontologia — ainda não confirmado.
**Equipe:** Só o fundador por enquanto.
**Ferramentas:** Next.js (fixado em 15.5.24 — restrição de glibc do build da Hostinger) + TypeScript + Tailwind CSS + Supabase (persistência, rate limit e qualificação comercial do Diagnóstico — **funcionando em produção**, validado end-to-end em 02/09/2026) + Resend (notificação transacional por e-mail do Diagnóstico, via `fetch`, sem SDK — **entregando em produção**, e-mail interno com resumo comercial confirmado em 02/09/2026) + Cloudflare Turnstile (anti-bot obrigatório server-side do formulário do Diagnóstico — `siteverify` via `fetch`, sem SDK; secret só no servidor; **ativo em produção**, token ausente/inválido → 403) no site institucional; deploy self-hospedado na Hostinger Web Apps (Node.js) com CDN da Hostinger na frente, MazyOS como sistema operacional interno de gestão/conteúdo. Testes E2E do site: Playwright (`site/e2e/`, `npm run quality` = lint + build + E2E; 78 testes) — 2ª camada do Quality Gate.
**Principais entregas:** Sites institucionais/comerciais, automação (atendimento, integrações), Google/Meta Ads, conteúdo e redes sociais.

## Contexto adicional

- Projeto do site institucional vive em `projetos/Noryos-Inovacoes/` — ver `decisoes-site.md` lá dentro pro briefing completo de posicionamento.
- A Noryos ainda não tem clientes reais nem cases — regra explícita do negócio: nunca inventar prova social (depoimento, número, logo fictício).
- **Diagnóstico Digital V2 — qualificação comercial automática (scoring V1):** decisão estrutural do projeto. Todo diagnóstico válido é pontuado no backend por regras determinísticas (`site/src/lib/diagnostico-scoring.ts`, sem IA), gerando maturidade digital (0–100), potencial comercial (0–100 → coluna `score`), classificação por faixa, prioridade, gaps, serviços Noryos recomendados e próxima ação. Versionado (`scoring_version`, hoje `v1`) pra recalibrar sem perder a leitura dos diagnósticos antigos. Score é **interno** — não aparece pro visitante. Ver `decisoes-site.md`. **VALIDADO EM PRODUÇÃO em 02/09/2026** (commit `219c35c`) — fluxo ponta a ponta conferido: form + Turnstile + envio, linha no Supabase (`score`/`maturidade_digital`/`classificacao`/`prioridade`/`scoring_version`/`resultado`), e-mail interno com resumo comercial, e teste negativo (POST sem Turnstile → 403, nada gravado).
