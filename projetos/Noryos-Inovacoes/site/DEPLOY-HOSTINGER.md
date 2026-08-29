# Deploy na Hostinger (plano Business — Web Apps / Node.js)

Este site roda **inteiro na Hostinger**, sem Vercel/Netlify. O plano
Business já inclui o produto **Web Apps** (hospedagem Node.js gerenciada,
até 5 apps), com integração GitHub e **build automático a cada push**.

## Como a conexão funciona (e o que o Claude/MCP tem a ver)

```
   você edita aqui  ──►  git push  ──►  GitHub  ──►  webhook  ──►  Hostinger
   (VS Code + Claude)                  (repo)                    (build + deploy)
```

- A esteira de deploy é **100% entre GitHub e Hostinger**. Você conecta
  o repositório uma vez no hPanel (OAuth do GitHub) e pronto.
- **O MCP / esta sessão do Claude não faz parte do caminho de produção.**
  O Claude é onde você escreve código e roda `git push`. Se fechar o
  Claude pra sempre, o deploy continua funcionando: todo push no branch
  conectado dispara rebuild na Hostinger.
- Não existe "MCP da Hostinger" nesse fluxo. (Existe a extensão
  *Hostinger Connector* pra VS Code, que faz deploy direto do editor —
  mas é um caminho alternativo ao GitHub, e não é o que vamos usar.)

## Compatibilidade — versão do Next.js (importante)

O projeto está fixado em **Next.js 15.5.x** de propósito. O Next 16 usa
Turbopack por padrão e seu binário nativo `@next/swc-linux-x64-gnu` exige
**GLIBC 2.29+**. O ambiente de build da Hostinger Web Apps roda glibc 2.28
(base Debian 10), então o build com Next 16 falha assim:

```
Attempted to load @next/swc-linux-x64-gnu, but:
/lib64/libm.so.6: version `GLIBC_2.29' not found
...
Failed to load next.config.ts
```

O Next 15.5 compila o SWC contra glibc 2.28 e usa **webpack** no `next build`
(sem Turbopack), então roda no ambiente da Hostinger. React 19, App Router,
Server Actions e Tailwind v4 seguem iguais — nada de funcionalidade mudou.

**Só voltar pro Next 16** depois de confirmar com a Hostinger que o glibc
do ambiente de build subiu pra 2.29+. Ver `AGENTS.md`.

## Pré-requisitos

- [x] Repositório no GitHub: `estrellasylegados-dotcom/noryosinovacoes`
      (o site vive no subdiretório `projetos/Noryos-Inovacoes/site`).
- [x] `next.config.mjs` com `output: "standalone"` e `outputFileTracingRoot`
      fixado nesta pasta (já configurado). É `.mjs` (ESM puro) de propósito:
      config `.ts` depende do SWC pra compilar, que é justamente o que
      quebra no ambiente da Hostinger.
- [x] `next` fixado em `15.5.24` no `package.json` (ver seção acima).
- [ ] Domínio `noryosinovacoes.com.br` na conta Hostinger (já é).
- [ ] Valores reais de ambiente (ver seção *Variáveis de ambiente*).

## Passo a passo no hPanel

1. **hPanel → Websites → Add Website → Web App** (ou *Node.js*).
2. **Conectar GitHub**: autorizar o app da Hostinger na conta
   `estrellasylegados-dotcom` e escolher o repo `noryosinovacoes`.
3. **Branch**: `main`.
4. **Root / diretório do app**: `projetos/Noryos-Inovacoes/site`.
   A Hostinger detecta a pasta onde está o `package.json` e builda só
   esse subdiretório — confirme que apontou pra essa e não pra raiz do
   repo.
5. **Framework**: Next.js (preset). Deve preencher sozinho:
   - Install: `npm install`
   - Build: `npm run build` (Next 15 → webpack, sem Turbopack)
   - Start / entrypoint: gerenciado pelo preset (Next.js `standalone`).
     Se pedir comando de start manual, usar:
     `node .next/standalone/server.js` (a Hostinger injeta a porta via
     `PORT`; o server standalone respeita `PORT` e `HOSTNAME`).
6. **Node version**: 22.x.
7. **Environment variables** (ver lista abaixo) — a Hostinger injeta
   tanto no build quanto no runtime e mantém entre deploys.
8. **Deploy**. Acompanhar o log de build. O primeiro build baixa deps +
   `next build` + sobe o servidor.
9. **Domínio**: na área do Web App, *Add domain* →
   `noryosinovacoes.com.br` e `www.noryosinovacoes.com.br`. Como o
   domínio já está na Hostinger, o DNS resolve interno; só emitir o
   SSL (Let's Encrypt, automático).
10. **Auto-deploy**: confirmar que *automatic deployment* está ligado
    (webhook do GitHub). A partir daí, todo push no `main` refaz o
    build e publica. Deploys rodam um por vez; pushes extras entram na
    fila.

## Variáveis de ambiente (hPanel → Environment variables)

Sem prefixo `NEXT_PUBLIC_` = fica só no servidor (nunca vai pro browser).

| Variável | Valor | Notas |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://noryosinovacoes.com.br` | canônica de SEO/sitemap |
| `NEXT_PUBLIC_CONTACT_EMAIL` | e-mail comercial real | fallback dos CTAs |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | E.164 sem símbolos, ex `5511999999999` | vazio = CTA cai em e-mail |
| `NEXT_PUBLIC_INSTAGRAM_URL` | opcional | footer / structured data |
| `NEXT_PUBLIC_LINKEDIN_URL` | opcional | footer / structured data |
| `SUPABASE_URL` | URL do projeto Supabase | sem isso o form valida mas não persiste |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key | **secreta — nunca commitar, nunca `NEXT_PUBLIC_`** |
| `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_META_PIXEL_ID` | quando existirem | analytics ainda não injetado no layout |

## Checklist antes do primeiro deploy

- [ ] `npm run build && npm run lint` passam localmente (ver abaixo).
- [ ] `.env` real preenchido nas Environment variables da Hostinger
      (não no repo — `.gitignore` já bloqueia `.env*` menos o example).
- [ ] Favicon e nome do responsável em `/sobre` revisados.
- [ ] Rodar a skill `/revisar-site-noryos` como checklist final.

## Verificação pós-deploy

1. Abrir `https://noryosinovacoes.com.br` — home carrega, SSL válido.
2. `/diagnostico` — enviar o formulário de teste e conferir se:
   - com Supabase configurado: a linha aparece na tabela `diagnosticos`;
   - sem Supabase: retorna sucesso e loga o aviso no log do app.
3. `/sitemap.xml` e `/robots.txt` respondem.
4. Fazer um commit bobo (ex: ajuste de texto), `git push`, e confirmar
   que a Hostinger dispara rebuild sozinha e a mudança aparece no ar.

## Se algo falhar

- **Build sem memória**: o plano Business tem limite fixo de RAM. Se o
  `next build` for morto (OOM), abrir chamado pra subir o limite ou
  avaliar Cloud Startup.
- **404 / erro de porta**: o app precisa escutar em `PORT` (injetada
  pela Hostinger). O server `standalone` do Next já respeita `PORT` —
  não fixar porta no código.
- **CSS/imagens 404 com `standalone`**: o server mínimo não copia
  `public/` e `.next/static` sozinho. O preset Next da Hostinger deve
  tratar isso; se não tratar, adicionar um passo pós-build:
  `cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/`
- **Build a partir da raiz do repo**: se a Hostinger não deixar apontar
  o subdiretório, o plano B é extrair `projetos/Noryos-Inovacoes/site`
  pra um repositório próprio e conectar esse.
