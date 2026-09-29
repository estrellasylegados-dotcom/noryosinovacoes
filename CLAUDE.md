# MazyOS — Sistema operacional do negócio

Sua empresa roda em cima desse arquivo. Aqui ficam as regras de operação
do MazyOS — como o Claude lê o contexto, aprende com correções, mantém
tudo atualizado e cria skills novas conforme a operação evolui.

Esse arquivo é editável. Quando o `/instalar` rodar, ele complementa o
final dessa página com as regras específicas do seu negócio.

---

## Premissa obrigatória — testar toda implementação

Toda e qualquer implementação ou mudança **deve ser testada antes de ser
dada como concluída**, para evitar erro ou implementação incorreta. Sem
exceção. Isso vale para código, conteúdo, config, automação e qualquer
alteração de arquivo.

- **Código / site:** rodar o que existir de verificação no projeto — no
  mínimo `build` + `lint` (ex: `npm run build && npm run lint` no
  `site/`), e o teste/preview relevante. Só reportar "pronto" depois que
  passar.
- **Se um teste falhar:** dizer explicitamente que falhou, colar a
  saída, e corrigir a causa — nunca reportar como concluído.
- **Se não for possível testar** (falta de ambiente, dependência, acesso):
  avisar claramente que a mudança **não foi testada** e o que falta pra
  validar. Não afirmar que está funcionando.
- Ao concluir, informar o que foi testado e qual foi o resultado.

---

## QUALITY GATE / DEFINITION OF DONE

> Regra obrigatória e permanente. Vale pra **todas** as tarefas, não só
> o site da Noryos. Tem prioridade sobre velocidade, conveniência,
> economia de passos e conclusão rápida. É melhor dizer "ainda não está
> validado" do que "pronto" sem evidência.

**Regra:** antes de informar que uma implementação está **pronta,
concluída, funcionando, validada, corrigida, publicada ou aprovada**,
execute os testes adequados ao tipo de tarefa e observe o resultado real
sempre que o ambiente permitir. Build, lint ou compilação isoladamente
**não comprovam funcionalidade**. Mudanças visuais ou interativas devem
ser verificadas em navegador real. Quando algo não puder ser testado,
declare explicitamente como **não validado**.

**Ciclo de toda tarefa:** ENTENDER → PLANEJAR → IMPLEMENTAR → EXECUTAR →
TESTAR → OBSERVAR O RESULTADO REAL → ANALISAR CRITICAMENTE → CORRIGIR →
RETESTAR → VALIDAR → só então DECLARAR CONCLUÍDO.

- Código alterado ≠ funcionalidade funcionando
- Build passando ≠ experiência funcionando
- Lint passando ≠ implementação correta
- Teste unitário passando ≠ fluxo completo validado
- "Concluído" exige evidência

**Vocabulário — sempre diferenciar o nível de validação:**
`IMPLEMENTADO` · `TESTADO` · `VALIDADO LOCALMENTE` · `VALIDADO EM
PRODUÇÃO`. Nunca colapsar um no outro. Ex.: "Implementei o favicon e
validei arquivo + metadata, mas não confirmei visualmente a aba do
navegador em produção" — nunca só "favicon funcionando".

**Proibido:** "deve funcionar" / "provavelmente funciona" / "está
pronto" sem dizer o nível de validação; declarar algo testado tendo só
lido o código; afirmar "favicon funcionando" ou "animações funcionando"
sem observar o resultado com o browser disponível.

**Status obrigatório em toda entrega relevante:** encerrar com
`QUALITY GATE: APROVADO` ou `QUALITY GATE: REPROVADO`. APROVADO só se os
testes pertinentes passarem. REPROVADO → continuar corrigindo ou
informar o bloqueio real.

**Relatório final padrão (tarefas relevantes):** IMPLEMENTADO / TESTES
EXECUTADOS / VALIDAÇÃO VISUAL / RESULTADO / CORREÇÕES REALIZADAS /
PENDÊNCIAS / QUALITY GATE.

**Checklist por tipo de entrega** (WEB/UI, BACKEND, API, AUTOMAÇÃO,
CONTEÚDO, DOCUMENTO, INFRA, INTEGRAÇÃO) e o Definition of Done detalhado
vivem na skill **`/validar-entrega`** — rodar antes de considerar
qualquer entrega relevante concluída. Pra o site institucional da
Noryos, `/validar-entrega` também encadeia `/revisar-site-noryos`.

---

## Contexto do negócio

No início de toda conversa, ler os seguintes arquivos (quando existirem
e estiverem preenchidos):

1. `_memoria/empresa.md` — quem é o usuário, o que faz, como funciona o negócio
2. `_memoria/preferencias.md` — tom de voz, estilo de escrita, o que evitar
3. `_memoria/estrategia.md` — foco atual, prioridades, prazos

Usar essas informações como base pra qualquer resposta ou decisão. Ao
sugerir prioridades, formatos ou abordagens, considerar o foco atual
descrito em `estrategia.md`.

Pra qualquer tarefa visual (carrossel, post, landing page), consultar
`identidade/design-guide.md` como referência de estilo.

Não é necessário listar o que foi lido nem confirmar a leitura. Apenas
usar o contexto naturalmente.

---

## Repositórios separados

- `projetos/CaptouLeads/` tem repositório git próprio (privado:
  `estrellasylegados-dotcom/captouleads`) e está fora do repo do
  workspace. `/salvar` precisa tratar essa pasta à parte.
- A exclusão dessa pasta é **local** (`.git/info/exclude`, não viaja no
  clone). Em computador novo: clonar o `captouleads` dentro de
  `projetos/CaptouLeads` e acrescentar `projetos/CaptouLeads/` ao
  `.git/info/exclude` do workspace.
- Plano vigente do CaptouLeads: `projetos/CaptouLeads/docs/plano-evolucao-v2.md`
  (executar uma fase por vez; a tabela de acompanhamento fica na seção 9).

---

## Fluxo de trabalho

Skills próprias do negócio (além das do MazyOS): `/validar-entrega` (Quality Gate), `/revisar-site-noryos` (checklist do site), `/auditar-site-prospect` (diagnóstico comercial de site de prospect) e `/deploy-captouleads` (deploy e validação do CaptouLeads na Vercel).

Antes de executar qualquer tarefa, verificar se existe skill relevante
em `.claude/skills/`. Se encontrar, seguir as instruções da skill. Se
não encontrar, executar a tarefa normalmente.

Ao concluir uma tarefa que não tinha skill mas parece repetível (o
usuário provavelmente vai pedir de novo no futuro), perguntar:

> "Isso pode virar uma skill pra próxima vez. Quer que eu crie?"

Não perguntar pra tarefas pontuais ou perguntas simples. Só quando o
padrão de repetição for claro.

---

## Aprender com correções

Quando o usuário corrigir algo, melhorar uma resposta ou dar uma
instrução que parece permanente (frases como "na verdade é assim", "não
faça mais isso", "prefiro assim", "sempre que...", "evita...", "da
próxima vez..."), perguntar:

> "Quer que eu salve isso pra não precisar repetir?"

Se sim, identificar onde faz mais sentido salvar:

- **Sobre o negócio** (clientes, serviços, mercado) → `_memoria/empresa.md`
- **Sobre preferências e estilo** (tom de voz, formato, o que evitar) → `_memoria/preferencias.md`
- **Sobre prioridades e foco** (projetos, metas, prazos) → `_memoria/estrategia.md`
- **Regra de comportamento nessa pasta** → próprio `CLAUDE.md`

Salvar com uma linha nova clara, sem reformatar o arquivo inteiro.
Confirmar mostrando a linha adicionada.

Não perguntar se a correção for óbvia de contexto imediato (ex: "na
verdade o arquivo se chama X"). Só perguntar quando a informação tiver
valor duradouro.

---

## Manter contexto atualizado

Ao terminar uma tarefa que mudou algo relevante (cliente novo, skill
nova, mudança de foco, processo novo, ferramenta instalada, estrutura
alterada), perguntar:

> "Isso mudou algo no teu contexto. Quer que eu atualize a memória?"

Se sim, identificar o que atualizar:

- **Cliente, serviço, ferramenta, equipe** → `_memoria/empresa.md`
- **Mudança de prioridade ou foco** → `_memoria/estrategia.md`
- **Tom ou estilo** → `_memoria/preferencias.md`
- **Pasta, regra de organização, skill criada** → `CLAUDE.md`
- **Visual (cores, fontes, logo)** → `identidade/design-guide.md`

Mostrar o que vai mudar antes de salvar. Não reformatar o arquivo
inteiro, só adicionar ou editar a linha relevante.

**Quando NÃO perguntar:**
- Tarefas pontuais sem impacto no contexto (escrever um email avulso, criar um post)
- Perguntas simples ou conversas sem ação
- Mudanças já salvas pelo bloco "Aprender com correções"

**Dica:** rode `/atualizar` pra uma varredura completa quando houver dúvida.

---

## Criação de skills

Quando o usuário pedir skill nova:

1. Verificar se existe template relevante em `templates/skills/`. Se
   existir, usar como base e adaptar pro contexto
2. Perguntar se é específica desse projeto ou útil em qualquer:
   - Específica → `.claude/skills/nome-da-skill/SKILL.md` (local)
   - Universal → `~/.claude/skills/nome-da-skill/SKILL.md` (global)
3. Ler `_memoria/empresa.md` e `_memoria/preferencias.md` pra calibrar
   o conteúdo da skill ao contexto do negócio
4. Se a skill precisar de arquivos de apoio (templates, exemplos),
   criar dentro da pasta da skill
5. Seguir o fluxo da skill-creator nativa do Claude Code

## CaptouLeads — Deploy e redeploy

CaptouLeads está **DEPLOYADO NA VERCEL** desde 26/09/2026 (URL pública: https://captouleads.vercel.app — as URLs `captouleads-<hash>-….vercel.app` exigem login da Vercel). Neon, `CRON_SECRET`, `APP_SECRET`, `APP_URL` e **Resend** (`RESEND_API_KEY`, `EMAIL_TRANSPORT=resend`, `EMAIL_FROM`) configurados em Production desde 27/09/2026, mais `TRUSTED_PROXY_HOPS=1`. A `RESEND_API_KEY` foi rotacionada em 27/09/2026 (chave nova só de envio, antiga apagada). Mercado Pago em **modo de teste** desde 27/09/2026: `MP_ACCESS_TOKEN` e `MP_WEBHOOK_SECRET` (Secret, do vendedor de teste), `MP_PUBLIC_KEY` (do vendedor de teste, usada pelo formulário de cartão no app), `BILLING_PROVIDER=mercadopago`, `MP_TEST_PAYER_EMAIL` (comprador de teste) e `BILLING_ALLOWED_EMAILS` (só as contas smoke abrem checkout). `PAGESPEED_API_KEY` (Secret) cadastrada em 28/09/2026, validada com chamada real; só vale após o próximo build e o recurso segue desligado pela flag `PAGESPEED_ENABLED`.

Regras de deploy:
- Variável de ambiente só vale em build feito depois dela: sem commit, usar `vercel redeploy <url do deploy de produção atual> --target production`.
- `APP_SECRET` **nunca** pode ser trocado: invalida os segredos criptografados e os hashes gravados.
- `vercel env add` pelo terminal trava esperando entrada: rodar com `--value "<valor>" --yes < /dev/null`.
- Deploy principal = `git push` no `main` do repo `captouleads` (dispara sozinho).
- O Root Directory do projeto na Vercel **precisa** ser `app`; vazio, o deploy via Git falha no `npm ci` (`missing_lock_file`).
- Flags da V2 (`LIVE_MODE_ENABLED`, `PAGESPEED_ENABLED` etc.) ligam pelo admin em **Configurações → Recursos (flags)**, sem redeploy (vale a partir do deploy do commit `81a51cb`). Variável de ambiente na Vercel tem prioridade e bloqueia o botão.
- Antes de ligar em produção os recursos das Fases 3.4 a 8.1 (as migrações 0005 a 0009 já rodaram no deploy de 29/09/2026, commit `a9116a2`; telas logadas validadas em produção): `COUPONS_ENABLED`: volta ao valor cheio (`PUT /preapproval`) testada no sandbox em 29/09/2026; ligar só com a decisão do Rafael; `AI_ENABLED` usa **Gemini** por decisão do Rafael em 29/09/2026 (adaptador no ar desde o commit `8ceaebf`, 29/09/2026; `AI_PROVIDER` padrão em produção já é `gemini`) e exige o teste cego (P2) para definir `AI_MODEL_PITCH`, `AI_PROVIDER=gemini` e `GEMINI_API_KEY` na Vercel pelo fluxo de segredo em arquivo local, faturamento ativo na chave (no nível gratuito o Google usa os dados), limite de gasto no painel do Google e a cota "Mensagens com IA/mês" nos planos; `OPPORTUNITY_PAGES_ENABLED` exige definir "Páginas de Oportunidade/mês" nos planos; `FREE_DIAGNOSIS_ENABLED` pede o Turnstile configurado (`TURNSTILE_SECRET` e `NEXT_PUBLIC_TURNSTILE_SITE_KEY`); `LIVE_MODE_ENABLED` e `TRIAL_EMAILS_ENABLED` não têm pré-requisito; `ALERTS_ENABLED` (Fase 9.1, no ar desde o commit `f093732`) exige marcar "Alertas semanais de empresas novas" no plano em `/admin/planos` (vale só para assinaturas novas).
- Lançamento das vendas: checklist em `projetos/CaptouLeads/docs/lancamento-vendas.md`. Termos/Privacidade leem `LEGAL_COMPANY`, `LEGAL_CNPJ`, `LEGAL_CONTACT_EMAIL` e `LEGAL_REVIEWED=1` (tira o aviso de minuta) da Vercel; páginas estáticas, exigem redeploy. `ADMIN_EMAILS=estrellasylegados@gmail.com` desde 29/09/2026 (provisório).
- Diagnosticar falha de build pelos Build Logs reais (API `/v3/deployments/<id>/events`), não por suposição.
- Segredo novo (chave de API, connection string) nunca vai pro chat: o usuário salva num arquivo local, o Claude lê sem exibir o valor, configura na Vercel e apaga o arquivo.
- A chave do Resend é só de envio: não consulta status de e-mail pela API. Para testar entrega, pedir recuperação de senha de uma conta `+smoke` (cai no Gmail do usuário) e ele confirma o recebimento.
- Antes de liberar pagamento a clientes: remover `MP_TEST_PAYER_EMAIL` e `BILLING_ALLOWED_EMAILS`, trocar para credenciais reais do Mercado Pago (Access Token **e** Public Key) e ter aprovação explícita do usuário.
- Assinatura é com cartão digitado no app (preapproval `authorized` + `card_token_id`), não o checkout hospedado do MP (que exige conta MP com o mesmo e-mail). Smoke de produção: `BILLING_SMOKE=1 BASE_URL=https://captouleads.vercel.app npx playwright test -c playwright.prod.config.ts billing-checkout` (em `app/`).
- O plugin oficial do Mercado Pago não funciona aqui (o login OAuth leva 403 do firewall do Mercado Livre): usar o painel "Suas integrações" com contas de teste vendedor/comprador.
- No sandbox, o Mastercard de teste não aceita recorrência: usar o Visa `4235 6477 2802 5682` (CVV 123, 11/30, titular `APRO` aprova, `OTHE` recusa).
