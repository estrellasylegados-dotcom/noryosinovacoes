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

## Fluxo de trabalho

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
