# Empresa

> Memória central do negócio. O Claude lê esse arquivo antes de cada resposta.
> Preenchido pelo `/instalar` — você pode editar a qualquer momento.

**Nome:** Rafael Viriato *(assumido a partir do ambiente do projeto — confirmar)*
**Negócio:** Noryos Inovações (noryosinovacoes.com.br)
**O que faz:** Empresa de soluções digitais e tecnologia pra pequenas e médias empresas — presença digital (sites), automação, aquisição e performance (Ads), e conteúdo. Posicionamento explícito de NÃO parecer agência de marketing tradicional.
**Perfil:** Iniciativa pessoal / founder-led — Rafael é responsável direto pelos projetos, sem equipe ainda.
**Atende clientes:** Público amplo de PME no início (pequenos negócios, profissionais liberais, prestadores de serviço, e-commerce). Possível nicho futuro em odontologia — ainda não confirmado.
**Equipe:** Só o fundador por enquanto.
**Ferramentas:** Next.js (fixado em 15.5.24 — restrição de glibc do build da Hostinger) + TypeScript + Tailwind CSS + Supabase (site institucional), deploy self-hospedado na Hostinger Web Apps (Node.js) com CDN da Hostinger na frente, MazyOS como sistema operacional interno de gestão/conteúdo. Testes E2E do site: Playwright (`site/e2e/`, `npm run quality` = lint + build + E2E) — 2ª camada do Quality Gate.
**Principais entregas:** Sites institucionais/comerciais, automação (atendimento, integrações), Google/Meta Ads, conteúdo e redes sociais.

## Contexto adicional

- Projeto do site institucional vive em `projetos/Noryos-Inovacoes/` — ver `decisoes-site.md` lá dentro pro briefing completo de posicionamento.
- A Noryos ainda não tem clientes reais nem cases — regra explícita do negócio: nunca inventar prova social (depoimento, número, logo fictício).
