---
name: validar-entrega
description: >
  Roda o Quality Gate antes de declarar qualquer entrega concluída. Detecta o
  tipo de tarefa (WEB/UI, BACKEND, API, AUTOMAÇÃO, CONTEÚDO, DOCUMENTO, INFRA,
  INTEGRAÇÃO), aplica só os testes pertinentes, observa o resultado real e emite
  APROVADO ou REPROVADO com relatório final padrão. Use quando o usuário disser
  "valida a entrega", "isso está pronto?", "roda o quality gate", "/validar-entrega",
  ou sempre antes de afirmar que algo está pronto/funcionando/publicado.
---

# /validar-entrega — Quality Gate obrigatório

Esta skill operacionaliza a seção **QUALITY GATE / DEFINITION OF DONE** do
`CLAUDE.md` da raiz. Roda antes de dizer "pronto". Sem exceção pra tarefas
relevantes (mudança de código, config, automação, conteúdo publicável,
infra). Perguntas simples e rascunhos internos não precisam.

**Princípio:** código alterado ≠ funcionalidade funcionando. Build/lint
passando ≠ experiência funcionando. "Concluído" exige evidência observada.

---

## Passo 1 — Detectar o tipo de entrega

Olhar o que mudou (`git status`/`git diff --stat`) e o pedido original.
Classificar em um ou mais tipos. Aplicar **só** os blocos pertinentes de
`checklists.md`:

| Tipo | Dispara quando a mudança toca… |
|---|---|
| **WEB/UI** | site, página, componente visual, navegação, formulário, animação, botão, modal, favicon, logo, menu, Header, Footer, layout, responsividade, SEO/metadata/OG |
| **BACKEND** | server actions, lógica de servidor, jobs, processamento |
| **API** | rotas HTTP, endpoints, contratos de request/response |
| **AUTOMAÇÃO** | scripts, n8n, cron, pipelines, geração de arquivos em lote |
| **CONTEÚDO** | artigo, carrossel, legenda, copy publicável, email |
| **DOCUMENTO** | proposta, spec, relatório, `.md` de contexto/decisão |
| **INFRA** | deploy, build config, DNS, CDN, `.env`, `next.config`, hospedagem |
| **INTEGRAÇÃO** | Supabase, WhatsApp, Meta/Google APIs, Analytics, e-mail |

Se não tiver certeza do tipo, tratar como o mais abrangente que se aplica
(quase sempre WEB/UI para o site).

---

## Passo 2 — Rodar o gate do(s) tipo(s)

Seguir `checklists.md` para cada tipo detectado. Regras transversais:

- **Ambiente permite testar → testar de verdade.** Não pular pra "deve
  funcionar".
- **Site da Noryos (WEB/UI) — 3 camadas, nesta ordem:**
  1. `/revisar-site-noryos` — lint + build + checklist de copy/LGPD/a11y/posicionamento.
  2. **Suíte E2E:** em `projetos/Noryos-Inovacoes/site/`, rodar
     `npm run quality` (lint + build + Playwright contra o build de
     produção). Ver `site/README.md` → "Testes E2E". `npm run quality`
     precisa passar **inteiro** antes de qualquer "pronto". Se um teste
     falhar por bug real, corrigir a aplicação e retestar — nunca
     afrouxar o teste. Screenshots de evidência saem em
     `site/e2e/__evidence__/`.
  3. **Inspeção visual humana:** abrir as telas alteradas (browser real
     ou `/webapp-testing`), olhar os screenshots de evidência, avaliar
     estética/layout/hierarquia. Playwright **não** aprova estética.
     Se não der pra observar de verdade, marcar como **não validada** —
     não fingir que observou.
- **Produção pode diferir do dev:** a suíte já roda contra `next start`
  (build de produção). Se já houver deploy, validar também a URL pública.
- **Sem credencial / sem ambiente:** marcar o item como **NÃO VALIDADO**
  e listar o que falta. Nunca afirmar que funciona.

---

## Passo 3 — Analisar criticamente o resultado

Não basta "renderizou". Para mudança visual, perguntar "isso ficou
realmente bom?" e avaliar alinhamento, hierarquia, legibilidade,
proporção, respiro, consistência, percepção premium. Tecnicamente correto
mas visualmente ruim → **não aprovar**: ajustar e retestar.

Verificar regressão no que é adjacente à mudança (ver `checklists.md` →
"Regressão").

---

## Passo 4 — Emitir o veredito e o relatório

Responder **sempre** neste formato:

```
IMPLEMENTADO
- <o que foi alterado>

TESTES EXECUTADOS
- <testes realmente feitos, com o comando/ação e o resultado>

VALIDAÇÃO VISUAL
- <o que foi observado no navegador / screenshot — ou "não aplicável" / "não validada: motivo">

RESULTADO
- <aprovado / problema encontrado e qual>

CORREÇÕES REALIZADAS
- <ajustes feitos após o teste — ou "nenhuma">

PENDÊNCIAS
- <o que não pôde ser validado e por quê — ou "nenhuma">

QUALITY GATE
- APROVADO   (só se todos os itens pertinentes passaram)
- REPROVADO  (qualquer item pertinente falhou ou ficou sem evidência crítica)
```

Se **REPROVADO**: continuar corrigindo, ou, se houver bloqueio real
(falta credencial, acesso, decisão do usuário), declarar o bloqueio
explicitamente e parar — sem chamar de "pronto".

---

## Regras

- Nunca declarar "pronto/concluído/funcionando/validado/corrigido/
  publicado/aprovado" sem ter passado por esta skill quando ela se aplica.
- Diferenciar sempre: `IMPLEMENTADO` ≠ `TESTADO` ≠ `VALIDADO LOCALMENTE`
  ≠ `VALIDADO EM PRODUÇÃO`.
- Não mascarar pendência pra parecer mais pronto (ex.: inventar prova
  social, ignorar erro de Console). Pendência conhecida e aceita
  (documentada em `decisoes-site.md`) não reprova; bug real sim.
- `curl` confirma status/headers/MIME/conteúdo básico — **não** comprova
  layout, animação, legibilidade, responsividade nem hover.
- Não criar teste inútil. Para UI crítica do site, a suíte E2E
  (Playwright) já existe em `projetos/Noryos-Inovacoes/site/e2e/` —
  ver `suite-e2e.md`.
- Segurança: antes de commit, checar que nenhum secret/token/`.env` está
  sendo versionado.

---

## Arquivos de apoio

- `checklists.md` — Definition of Done detalhado por tipo de entrega.
- `suite-e2e.md` — a suíte Playwright do site da Noryos: o que cobre,
  como rodar (`npm run quality` / `npm run test:e2e`), como estender sem
  criar teste frágil.
