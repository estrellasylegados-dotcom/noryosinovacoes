---
name: revisar-site-noryos
description: >
  Roda um checklist pré-publicação no site institucional da Noryos Inovações
  (projetos/Noryos-Inovacoes/site): UX, copy, mobile, SEO, performance,
  acessibilidade, links, formulários, tracking e LGPD. Use quando o usuário
  disser "revisa o site da Noryos", "checklist antes de publicar",
  "/revisar-site-noryos", ou pedir uma checagem final antes do deploy.
---

# /revisar-site-noryos — Checklist pré-publicação

## Dependências

- Projeto: `projetos/Noryos-Inovacoes/site/`
- Regras de posicionamento e credibilidade: `projetos/Noryos-Inovacoes/decisoes-site.md`
- Identidade visual: `projetos/Noryos-Inovacoes/identidade/design-guide.md`

---

## Workflow

### Passo 1 — Rodar checagens automatizadas

Dentro de `projetos/Noryos-Inovacoes/site/`:

```bash
npm run lint
npm run build
```

Corrigir qualquer erro antes de seguir. Se o build passar, checar no
output se todas as rotas esperadas foram geradas (`/`, `/solucoes`,
`/solucoes/sites`, `/solucoes/automacoes`, `/solucoes/performance`,
`/sobre`, `/diagnostico`, `/contato`, `/politica-de-privacidade`).

### Passo 2 — Checklist manual

Percorrer e reportar o que falhar:

**Posicionamento e copy**
- [ ] Nenhum texto soa como "agência de marketing" (ver `decisoes-site.md`)
- [ ] Nenhum buzzword proibido ("revolucionamos", "soluções 360", "agência completa", "somos apaixonados")
- [ ] CTA principal é "Conversar sobre meu projeto" (ou variação aprovada) — nada de "saiba mais"/"clique aqui" genérico
- [ ] Presença Digital aparece com mais peso visual/textual que os demais serviços

**Credibilidade (crítico)**
- [ ] Nenhum cliente, depoimento, número, logo ou selo fictício apresentado como real
- [ ] Cenários demonstrativos estão claramente rotulados como hipotéticos

**Formulário de diagnóstico**
- [ ] As 5 etapas funcionam e validam corretamente
- [ ] Consentimento LGPD é obrigatório pra enviar
- [ ] Link pra Política de Privacidade funciona
- [ ] Honeypot e checagem de tempo mínimo continuam ativos (`src/app/diagnostico/actions.ts`)

**SEO/GEO/AEO**
- [ ] Cada página tem `title`/`description` únicos
- [ ] `sitemap.ts` inclui todas as rotas publicadas
- [ ] JSON-LD presente (Organization, WebSite, Service nas páginas de solução, FAQPage na Home)

**Acessibilidade e performance**
- [ ] Contraste de texto adequado sobre o fundo escuro
- [ ] Navegação por teclado funciona no menu e no formulário
- [ ] `prefers-reduced-motion` reduz/desliga animação (testar no DevTools)
- [ ] Nenhum `console.error` ao navegar pelas páginas principais

**Configuração**
- [ ] `.env.local` real está preenchido antes do deploy (WhatsApp, Supabase, analytics) — nunca commitado
- [ ] Nenhuma credencial hardcoded no código

### Passo 3 — Reportar

Listar o que passou, o que falhou e o que é pendência conhecida (ver
`decisoes-site.md` → "Pendências reais") vs. bug de verdade. Não travar
a entrega por pendência já documentada e aceita (ex: Supabase ainda não
configurado) — travar só por bug real ou violação das regras acima.

---

## Regras

- Nunca "consertar" copy inventando prova social pra parecer mais pronto — reportar como pendência, não mascarar
- Se o `npm run build` falhar, resolver o erro antes de continuar o checklist
- Rodar esta skill sempre antes de qualquer deploy real do site
