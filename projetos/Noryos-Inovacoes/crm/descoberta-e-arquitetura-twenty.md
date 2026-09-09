# Twenty CRM — Descoberta e Arquitetura (Fase 0)

> **Status:** FASE DE DESCOBERTA. Nada foi implementado, instalado, integrado ou configurado.
> **Data:** 08/09/2026
> **Objetivo da Noryos:** começar a vender. "Kaptar encontra. Twenty organiza. Noryos vende."
> **Escopo desta entrega:** relatório de arquitetura + lista de decisões para aprovação. Ao final, **PARAR e aguardar aprovação do Rafael.**

**Legenda de classificação usada no documento inteiro:**

- 🟢 **CONFIRMADO NA DOCUMENTAÇÃO** — verificado na doc oficial do Twenty (twenty.com, docs.twenty.com, github.com/twentyhq/twenty) em 08/09/2026.
- 🔵 **RECOMENDAÇÃO NORYOS** — decisão de modelagem/processo proposta por esta análise. Não é fato do produto.
- 🟠 **DECISÃO PENDENTE** — depende do Rafael antes de configurar.

Fontes no rodapé. Versão do Twenty avaliada: linha **2.26.x** (release mais recente listada: 2.26.0, 31/07/2026). Produto em cadência de releases frequente (~semanal).

---

## 1. Resumo executivo

**A escolha do Twenty Cloud Pro está tecnicamente coerente e é a recomendação.** Para a Fase 1 (validar processo comercial, sem infra, sem código), o plano Pro entrega tudo que a Noryos precisa: objetos nativos (Company / Person / Opportunity / Task / Note), pipeline Kanban por estágio, campos e views customizados ilimitados, importação de CSV com atualização de registros existentes, API REST + GraphQL e webhooks para o futuro, e um servidor MCP nativo. Custo: **US$ 9/usuário/mês** (ou ~US$ 6,75 no anual) com **teste grátis de 30 dias sem cartão** — dá para montar e validar a Fase 1 inteira antes de pagar.

**Não há razão objetiva para self-hosting agora.** O stack self-hosted (PostgreSQL + Redis + server + worker + storage S3 + TLS + backups + upgrades semanais com migração) custa mais em tempo e risco do que os ~US$ 81–108/ano do Cloud para 1 usuário. Migração Cloud ↔ self-hosted é documentada nos dois sentidos: sem lock-in estrutural.

**A modelagem recomendada usa só objetos nativos.** Zero Custom Objects na Fase 1. A distinção **Empresa captada ≠ Lead qualificado ≠ Opportunity** é resolvida com um campo `Status de prospecção` (Select) na Company + a regra de só criar Opportunity quando existir conversa comercial real. Isso mantém o pipeline limpo — nada de centenas de registros frios do Kaptar poluindo o Kanban.

**Pontos de atenção que exigem decisão ou cuidado operacional:**

1. O Twenty **não tem deduplicação fuzzy** na importação de CSV — só casa em campo marcado como *único*. A estratégia de chave de deduplicação precisa ser montada **antes** de importar Kaptar em escala (seção 14).
2. CSV do Kaptar **não entra cru**: vírgula decimal, telefone e acento precisam de um passo de transformação (seção 15).
3. Créditos de workflow: 50/ano (plano anual). Automação padrão é praticamente gratuita; **IA consome rápido** (seção 16).
4. Cloud Pro **não tem** log de auditoria nem backup completo em um clique — exige rotina manual de export (seções 19 e 21).

**Nenhuma decisão desta fase cria retrabalho estrutural** desde que se respeite: sem fork, sem alterar o core, extensão só por configuração / API / Apps.

---

## 2. Validação da escolha Twenty Cloud Pro

### 2.1 O que o Pro entrega — 🟢 CONFIRMADO NA DOCUMENTAÇÃO

| Recurso | Pro (US$ 9/user/mês) |
|---|---|
| Custom objects / fields / views | Ilimitados |
| Tipos de view | Table, Kanban, Calendar |
| Registros | Ilimitados |
| Import / export CSV | Sim (import até 10.000 linhas/arquivo; export até 20.000/arquivo) |
| Workflows + AI agents | Sim |
| Créditos de workflow/IA | "50 workflow credits/year" (anual) · 5/mês (mensal) — pool compartilhado com IA |
| API REST + GraphQL | Sim — **50 req/min** no Pro |
| Webhooks | Sim |
| Servidor MCP | Sim |
| Custom apps | Ilimitados (build/instalar no próprio workspace) |
| Papéis de usuário | Ilimitados |
| Permissões | Objeto (ver/editar/excluir/destruir) + nível de campo |
| 2FA | Sim |
| Sync e-mail + calendário | Sim (Google Workspace + Microsoft 365, várias caixas por usuário) |
| Dashboards | Ilimitados |
| Subdomínio | `suaempresa.twenty.com` |
| Idiomas | 30+ (inclui português) |
| Suporte | Comunidade + Help center + e-mail/chat |
| Teste grátis | **30 dias, sem cartão de crédito** |

### 2.2 O que o Pro **não** tem (só no Organization — US$ 19/user/mês) — 🟢 CONFIRMADO

- Permissões a nível de linha (*row-level* — ex: "vendedor só vê as próprias oportunidades")
- SSO (SAML/OIDC)
- **Log de auditoria**
- Rotação de chave de criptografia
- Domínio próprio (`crm.noryos.com.br`)
- API a 100 req/min (Pro é 50)
- Instalar app empacotado de terceiro (*shared tarball*)
- Suporte prioritário

### 2.3 Veredito — 🔵 RECOMENDAÇÃO NORYOS

**Twenty Cloud Pro, 1 assento (Rafael), começando pelo teste de 30 dias.** Nenhum recurso do Organization é necessário na Fase 1–2:

- Row-level permission não faz diferença com 1 operador.
- SSO não se aplica.
- Log de auditoria seria bom para postura de LGPD, mas para o volume/estágio atual a rotina manual de export cobre o risco. Reavaliar quando entrar 2º usuário ou quando a base passar de alguns milhares de leads.

**Billing anual vs mensal (🟠 DECISÃO PENDENTE — D1):** anual dá −25% no assento (~US$ 6,75/mês → ~US$ 81/ano) mas entrega 50 créditos de uma vez no ano; mensal custa cheio (US$ 9) mas entrega 5/mês (~60/ano equivalente, sem acúmulo além de 1 período). Como automação padrão praticamente não consome crédito, **o anual ganha** (mais barato no assento, e a diferença de crédito é irrelevante para uso não-IA). Recomendação: **anual**, decidido antes do fim do teste.

---

## 3. Recursos atuais confirmados no Twenty — 🟢 CONFIRMADO NA DOCUMENTAÇÃO

**Objetos e dados**
- Objetos padrão: **People, Companies, Opportunities, Notes, Tasks**, Workspace Members (+ anexos/atividades de timeline).
- Objetos padrão podem ser usados como estão, customizados ou **desativados**.
- Custom objects e custom fields **ilimitados**; sem mudança de preço por volume.
- Limite de **1.600 campos por objeto** (contando desativados) — política de uso justo.
- Relações: 1‑para‑muitos, muitos‑para‑1, muitos‑para‑muitos.

**Tipos de campo:** Text, Long Text, Number, Currency, Date, Date & Time, Boolean, **Select**, **Multi‑Select**, **Rating (1–5 estrelas)**, Phone, Email, Links, Address (rua/cidade/estado/país/CEP), Domain, Array, JSON, Relation. Campo customizado pode ser marcado como **único**.

**Views / pipeline**
- Views: Table, Kanban, Calendar. Kanban agrupa automaticamente pelo campo Select escolhido (para Opportunity, o campo **Stage**). Colunas do Kanban reordenáveis.
- Recursos de pipeline documentados: "Set up a sales pipeline", "Show expected amount in pipeline", **"Track time in stage"**, "Detect stale opportunities".
- Views podem ter acesso restrito por papel.

**Tasks / Notes**
- Task: data de vencimento, responsável, status de conclusão; vinculável a People, Companies, Opportunities e outros registros.
- Note: texto livre, anexável a qualquer registro. Calendário/reunião entra como evento de calendário + Note (não existe objeto "Meeting" de primeira classe).

**Importação / migração**
- Formatos: CSV, XLSX, XLS. **Um tipo de objeto por arquivo.**
- Limite: **10.000 registros/arquivo** no import por CSV; import via API sem limite; export **20.000/arquivo**.
- Encoding **UTF‑8 recomendado**. Datas: `YYYY‑MM‑DD` ou ISO 8601.
- **Campos precisam existir antes** do import (criar os custom fields primeiro).
- Campo Select no CSV: usar o **API name da opção**, não o rótulo visível (ativar *Advanced mode* para ver os API names).
- Telefone: colunas aninhadas (número / country code / calling code).
- E‑mails adicionais: array JSON `["a@x.com","b@x.com"]`. Links: `[{"url":"...","label":"..."}]`.
- Ordem de import: **Companies → People → Opportunities → custom objects**.
- "Update existing records via import": se o valor de um campo único casar com registro existente, **o registro é atualizado** (não duplica). Recomendado casar **só um** campo único por vez.
- Import por IA (a partir da v2.18): arquivos maiores, *matching* de relação mais confiável, *bulk update*.

**Deduplicação / unicidade**
- Campos únicos padrão: People = `id`, `email`; Companies = `id`, `domain`; **custom objects = só `id`**.
- Dá para marcar campos adicionais como únicos: Settings → Data Model → campo → *Unique*.
- Duplicatas **dentro do arquivo** são destacadas em amarelo e editáveis antes de importar.
- **Registros com soft‑delete entram na checagem de unicidade** — reimportar um valor único que casa com um registro excluído **restaura** o registro.

**API / integração**
- REST **e** GraphQL, schema gerado por workspace (endpoints com o nome dos seus objetos/campos).
- Auth: **API key**, header `Authorization: Bearer`, escopável a um papel.
- Rate limit Cloud: **50 req/min (Pro)** / 100 req/min (Organization). Lote: **60 registros por chamada**.
- **Metadata API** (`/rest/metadata/`, `/metadata/`): criar/alterar/excluir objetos, campos e relações por código.
- GraphQL: *batch upsert*, travessia de relações em uma query, sem limite de linha no export.

**Webhooks**
- Eventos: `*.created`, `*.updated`, `*.deleted` — todos os objetos, inclusive custom.
- Payload POST: `event`, `data` (registro completo), `timestamp`.
- Assinatura: `X-Twenty-Webhook-Signature` (HMAC SHA256) + `X-Twenty-Webhook-Timestamp`. Receptor deve responder 2xx.

**Workflows**
- Gatilhos: mudança de registro, agendamento (cron), webhook de entrada, manual.
- Ações: buscar/criar/atualizar/excluir registro, ramificações, iterador, enviar e‑mail, HTTP request, code (TypeScript), ações de IA.
- Receitas oficiais: "Closed Won Automations", "Detect Stale Opportunities", "Send Email Alerts with Tasks Due", "Notify Teammates of a Note to Review", "Auto‑Reply to Inbound Emails", *Formula Fields*.
- Rascunho não consome crédito; workflow que falha consome pelos passos concluídos.

**Créditos (pool único: workflows + AI agents + AI chat)**
- Mensal: **5 créditos/mês** (~US$ 5 de uso). Anual: **50 créditos/ano** (~US$ 50 de uso).
- Passo padrão de workflow: **US$ 0,0001** cada = **~10.000 execuções por crédito**. → "automação padrão é efetivamente grátis".
- Code / HTTP: fração de crédito. Mensagem rápida de IA: fração de centavo. Tarefa grande de AI agent: **US$ 1+**. Busca web de IA: custo fixo por busca.
- Créditos não usados acumulam, com teto de 1 período. Dá para comprar pacote extra (Settings → Billing → "Increase") a qualquer momento.

**IA**
- AI Chatbot: pergunta em linguagem natural sobre os dados. AI Agents: enriquecimento, rascunho de e‑mail, análise de pipeline, roteamento de dados de entrada.
- IA **respeita o modelo de permissão** — só acessa objetos/campos que o papel pode ver.

**MCP** — 🟢 CONFIRMADO que existe no Pro ("MCP server: Yes" na página de preços). Autenticação por API key; capacidades alinhadas à API (CRUD em people/companies/tasks/notes, descoberta de schema). Doc oficial detalhada é **rasa** — validar na mão antes de depender.

**E‑mail / calendário**
- Google Workspace + Microsoft 365; várias caixas por usuário.
- E‑mails sincronizados, thread completa na timeline do registro; envio a partir do Twenty. Eventos de calendário sincronizam.
- Auto‑associação de e‑mails/eventos a Company + People que casam.
- Controle de import: filtro por intervalo de data e por remetente.

**Papéis / permissões**
- Papel Admin (não deletável) + papel padrão para novos membros + papéis custom.
- Controle a nível de objeto (ver/editar/excluir/destruir, com exceções por objeto) + nível de campo (ver / editar / oculto).
- Row‑level só no Organization.
- API key recebe papel via Settings → Members → Roles; key sem papel usa permissão padrão.

**Apps (framework de extensão)**
- Pacotes TypeScript que declaram objetos, campos, views, *logic functions* (gatilho HTTP/cron/evento de banco), componentes React em sandbox, *skills & agents*, itens de menu.
- CLI (`yarn twenty app:*`), *live‑sync*, detecção de entidades por AST, versionamento em git. Publicação privada (self‑host) ou pública (npm + marketplace).
- SDK / UI / `packages/twenty-apps` são **MIT** (não AGPL). Framework introduzido na **v2.0.0 (abr/2026)** — novo, em evolução.

**Self‑hosting**
- Docker Compose. Componentes: **PostgreSQL** (banco), **worker** (jobs de fundo: import de mensagem, sync de calendário, gatilho de workflow, cron), **server** (backend). Redis usado pela fila do worker (doc rasa mas necessário no stack real). Storage: filesystem local por padrão; **S3 / compatível (MinIO, DO Spaces) para produção**.
- Mínimo **2 GB RAM**. Segredos: `ENCRYPTION_KEY` (perder = perder todo segredo do banco), `FALLBACK_ENCRYPTION_KEY` (rotação), `PG_DATABASE_PASSWORD`, `SERVER_URL`.
- Migração self‑hosted → Cloud documentada.

**Licença**
- Core: **AGPL‑3.0**. SDKs / `twenty-ui` / `packages/twenty-apps`: **MIT**. Arquivos marcados `/* @license Enterprise */`: licença comercial Twenty.com (uso em produção exige assinatura válida).

**Export / backup (Cloud)**
- Export por view: CSV, **máx. 20.000 registros/export**, inclui custom fields, **exclui anexos/imagens**.
- **Não há backup de workspace inteiro em um clique** — usar export por objeto + GraphQL (sem limite de linha) para extração completa.

---

## 4. Limitações relevantes

| # | Limitação | Classificação | Impacto na Noryos | Mitigação |
|---|---|---|---|---|
| L1 | Sem deduplicação fuzzy/probabilística no import de CSV — só casa em campo *único* exato | 🟢 | Alto — Kaptar traz o mesmo negócio em buscas/raios/nichos diferentes | Chave de dedup sintética montada no preparo do CSV (seção 14) |
| L2 | Registro com soft‑delete entra na unicidade e é **restaurado** por reimport de valor único que casa | 🟢 | Médio — lead desqualificado "excluído" volta à base | Não excluir desqualificado — usar status "Não qualificado". Erasure LGPD = *Destroy* + parar de reimportar |
| L3 | Select no CSV exige API name da opção, não o rótulo | 🟢 | Médio — erro silencioso de import | Planilha de‑para de API names antes de importar |
| L4 | Number espera ponto decimal; telefone em colunas separadas; sem orientação p/ dado BR | 🟢 | Alto — CSV do Kaptar não entra cru | Passo de transformação (seção 13/15) |
| L5 | Import CSV: teto de **10.000 linhas/arquivo** | 🟢 | Baixo/Médio | Fatiar pulls grandes do Kaptar |
| L6 | Export Cloud: **20.000 registros/arquivo**, sem backup total em 1 clique | 🟢 | Médio (portabilidade/backup) | Rotina mensal de export por objeto + GraphQL |
| L7 | Pro sem log de auditoria e sem row‑level permission | 🟢 | Baixo agora (1 operador) | Reavaliar no 2º usuário / escala de base |
| L8 | Créditos: pool único; **IA queima rápido** (tarefa grande de agent = US$ 1+) | 🟢 | Médio na Fase 4–5 | Não colocar IA em loop; monitorar o medidor; comprar pacote se preciso |
| L9 | Company **pode não ter** campo Phone nativo (Phone é nativo em Person) | 🟠 verificar no setup | Médio — telefone do Kaptar muitas vezes vem sem contato nomeado | Custom field `Telefone principal` (Phone) na Company |
| L10 | Tipo de campo **não muda** depois de criado | 🟢 | Médio — errar o tipo custa migração | Decidir os tipos agora (este documento); campo novo + migrar + desativar velho |
| L11 | API 50 req/min no Pro | 🟢 | Baixo (só importa na Fase 3) | Lotes de 60 registros → ~3.000/min efetivos, suficiente |
| L12 | Apps framework novo (v2.0, abr/2026), em evolução | 🟢 | Baixo (só Fase 5) | Não apostar Fase 1–2 em Apps |
| L13 | MCP: doc oficial rasa | 🟢 (existência) / 🟠 (detalhe) | Baixo (futuro) | Validar na mão antes de depender |
| L14 | Twenty ~1 release/semana com migração | 🟢 | Positivo no Cloud (gerenciado) · risco no self‑host | Razão a mais para ficar no Cloud agora |

---

## 5. Modelo de dados recomendado — 🔵 RECOMENDAÇÃO NORYOS

**Princípio:** só objetos nativos. Custom field só quando não existe nativo equivalente e o campo serve **diretamente** para vender agora. Todo o resto é Fase 4+.

### 5.1 Company (empresa prospectada / cliente)

**Nativo — usar como está (não criar custom):**

| Necessidade Noryos | Campo nativo |
|---|---|
| Nome da empresa | `Name` |
| Site / domínio | `Domain Name` (tipo Domain — também é chave de dedup nativa) |
| Cidade / Estado / Endereço | `Address` (subcampos cidade/estado/país/CEP) |
| Responsável Noryos pela conta | `Account Owner` (relação com Workspace Member) |
| LinkedIn | `Linkedin` |
| Nº de funcionários | `Employees` (Kaptar não fornece — fica vazio, tudo bem) |
| Resumo do Kaptar / contexto | **Note** anexada (não é campo) |

**Custom fields — Fase 1 (enxuto, ~11):**

| Campo | Tipo | Opções / observação |
|---|---|---|
| `Segmento` | Select | Odontologia · Estética · Oficina · Autopeças/Motopeças · Comércio local · Serviços locais · Outro |
| `Telefone principal` | Phone | Se confirmado que Company não tem Phone nativo (L9) |
| `WhatsApp provável` | Phone | Nome já sinaliza que **não é validado** |
| `Origem do lead` | Select | Kaptar · Indicação · Inbound (site) · Prospecção manual · Evento · Outro |
| `Data de captura` | Date | Do Kaptar ("Encontrado em") |
| `Status de prospecção` | Select | Captado · Em análise · Contato iniciado · Qualificado · Não qualificado · Cliente |
| `Prioridade` | Select | Alta · Média · Baixa · Não avaliado |
| `Tipo de presença web` | Select | Site próprio · Página de rede/franquia · Microsite/link page · Instagram como site · Página simplificada · Sem site · Não analisado |
| `Kaptar Score` | Number | Valor cru do Kaptar |
| `Avaliação Google` | Number | Nota (decimal) |
| `Nº de avaliações Google` | Number | Inteiro |
| `Google Maps` | Links | URL do Kaptar (base p/ dedup futura por Place ID) |
| `Instagram` | Links | Para filtrar "tem IG?" |
| `Facebook` | Links | |
| `Chave de dedup` (`dedupeKey`) | Text · **Unique** | Chave sintética montada no preparo do CSV (seção 14) |

> São ~15 linhas na tabela mas várias são triviais (Links/Number). O núcleo que exige decisão são os 5 Selects. Se quiser cortar mais: `Facebook`, `WhatsApp provável` e `Google Maps` podem ficar para a Fase 2 sem prejuízo do processo de venda.

**Custom fields — NÃO criar agora (Fase 4+):** `Digital Gap Score`, `Commercial Fit Score`, `Opportunity Score`, `Auditoria digital`. Nenhum contribui para vender no dia 1.

### 5.2 Person (contato)

**Nativo:** `First name`, `Last name`, `Emails`, `Phones`, `Company` (relação), `Job Title`, `City`, `Linkedin`, `X`. Observação livre → `description` nativo ou Note.

**Custom — Fase 1 (1 campo):**

| Campo | Tipo | Opções |
|---|---|---|
| `Tipo de contato` | Select | Proprietário · Sócio · Gerente · Decisor · Contato comercial · Responsável técnico · Desconhecido |

**Padrão:** contato importado do Kaptar entra como **Desconhecido** — o sistema **nunca** assume que "Responsável" do Kaptar = decisor. `Instagram` (Links) só se virar canal real de contato.

### 5.3 Opportunity (negociação comercial real)

**Nativo:** `Name`, `Amount` (Currency — configurar BRL), `Close date`, `Stage`, `Point of Contact` (relação Person), `Company` (relação), `Account Owner`.

**Custom — Fase 1:**

| Campo | Tipo | Opções | Nota |
|---|---|---|---|
| `Oferta` | **Select** | Landing Page · Site Institucional · Site Estruturado · Performance 1 Canal · Performance Multicanal · Presença Digital · Noryos Care · Combinação · A definir | Select (não Multi‑Select) — ver 5.4 |
| `Motivo da perda` | Select | Preço · Timing · Sem budget · Sem fit · Concorrente · Sem resposta · Outro | Opcional, mas barato e de alto valor de aprendizado |

**Não criar:** `Probabilidade` (o Stage já implica — Fase 2 se quiser *weighted pipeline*), `Próxima ação` (é **Task**, não campo), `Origem` (herda da Company), `Observações` (é `description`/Note).

### 5.4 "Oferta": Select vs Multi‑Select — 🔵 RECOMENDAÇÃO

**Select (opção única).** Motivos:
- Kanban e relatório de win/loss por oferta só funcionam bem com dimensão única.
- Combos reais (ex: Site + Performance) são cobertos pela opção **"Combinação"** + detalhamento do escopo no `description`/Note da Opportunity.
- Se, com dados reais, o detalhe de bundle passar a importar para relatório, aí sim adicionar um Multi‑Select `Serviços no escopo` como campo secundário — sem quebrar nada.

---

## 6. Objetos nativos que serão usados — 🟢 CONFIRMADO (existência) / 🔵 (uso)

| Objeto nativo | Uso na Noryos |
|---|---|
| **Company** | Toda empresa prospectada **e** cliente. O "lead" **não** é objeto separado — é o `Status de prospecção` da Company. |
| **Person** | Contato / responsável / proprietário / gerente / responsável técnico. Diferenciados pelo `Tipo de contato`. |
| **Opportunity** | Negociação comercial específica. **Criada só quando há oportunidade real** (ver seção 10). |
| **Task** | Próximo passo comercial. Uma Task aberta por Company "em contato" e por Opportunity aberta. |
| **Note** | Reunião, diagnóstico, resumo do Kaptar, informação comercial relevante. Reunião = evento de calendário + Note. |
| Workspace Member | O próprio Rafael (Account Owner). |

**Custom Objects: nenhum na Fase 1.** Avaliação: os nativos cobrem 100% do fluxo Kaptar → qualificação → contato → reunião → diagnóstico → proposta → negociação → fechado/perdido. Criar Custom Object agora só adiciona custo de manutenção e complica import (custom object só dedup por `id`).

---

## 7. Campos customizados necessários — resumo consolidado — 🔵 RECOMENDAÇÃO

**Company (Fase 1):** `Segmento` (Select) · `Telefone principal` (Phone, se L9) · `WhatsApp provável` (Phone) · `Origem do lead` (Select) · `Data de captura` (Date) · `Status de prospecção` (Select) · `Prioridade` (Select) · `Tipo de presença web` (Select) · `Kaptar Score` (Number) · `Avaliação Google` (Number) · `Nº de avaliações Google` (Number) · `Google Maps` (Links) · `Instagram` (Links) · `Facebook` (Links) · `dedupeKey` (Text, **Unique**).

**Person (Fase 1):** `Tipo de contato` (Select).

**Opportunity (Fase 1):** `Oferta` (Select) · `Motivo da perda` (Select, opcional).

**Total:** ~17 custom fields, sendo 8 Selects (o trabalho real de configuração está aí). Todos com API name em snake_case documentado numa planilha para o import.

---

## 8. Campos que NÃO devemos criar — 🔵 RECOMENDAÇÃO

| Não criar | Por quê | Usar em vez disso |
|---|---|---|
| `Nome da empresa`, `Domínio/site` | Nativo | `Name`, `Domain Name` |
| `Cidade`, `Estado`, `Endereço` | Nativo | `Address` (subcampos) — *ver nota abaixo* |
| `Responsável Noryos` | Nativo | `Account Owner` |
| `Descrição` / `Resumo` da empresa | Poluição; texto do Kaptar é não‑verificado | **Note** anexada |
| `Digital Gap Score`, `Commercial Fit Score`, `Opportunity Score` | Fase 4 — não ajudam a vender no dia 1 | — (adiar) |
| `Auditoria digital` | Fase 4 | Skill `/auditar-site-prospect` fora do CRM por enquanto |
| Opportunity `Probabilidade` | Stage já implica | *Weighted pipeline* na Fase 2 se necessário |
| Opportunity `Próxima ação` | É acompanhamento, não atributo | **Task** com data |
| Opportunity `Data prevista`, `Valor estimado` | Nativo | `Close date`, `Amount` |
| Person `Observação` | Nativo | `description` ou Note |
| `Tem site` (booleano) | Perde informação; Kaptar erra (IG marcado como site) | `Tipo de presença web` (Select, seção 12) |

> **Nota sobre Cidade/Estado (🟠 verificar no setup):** se filtrar/agrupar view por subcampo de `Address` se mostrar incômodo na prática, adicionar `Cidade` (Text) + `UF` (Select) como exceção pontual. Verificar nos primeiros dias; não criar preventivamente.

---

## 9. Pipeline recomendado — 🔵 RECOMENDAÇÃO NORYOS

### 9.1 Análise: o pipeline de 8 passos do briefing não é tudo "Stage"

Os 8 passos pedidos — Novo lead · Contato iniciado · Reunião agendada · Diagnóstico · Proposta enviada · Negociação · Fechado · Perdido — misturam **dois funis diferentes**:

- **"Novo lead" e "Contato iniciado"** são estados **da empresa prospectada**, antes de existir negócio. Se virarem Stage de Opportunity, você é obrigado a criar uma Opportunity para cada empresa do Kaptar → centenas de registros frios no Kanban (exatamente o que você quer evitar).
- **De "Reunião agendada" em diante** já existe conversa comercial real → aí sim é Opportunity.

### 9.2 Modelagem recomendada — dois níveis

**Nível 1 — `Status de prospecção` na Company (pré‑funil, não é Kanban de vendas):**

`Captado` → `Em análise` → `Contato iniciado` → `Qualificado` **ou** `Não qualificado` → (`Cliente` quando fecha)

**Nível 2 — `Stage` na Opportunity (o funil comercial de verdade, Kanban):**

| # | Stage | Quando entra |
|---|---|---|
| 1 | `Qualificado` | Oportunidade aberta — Rafael decidiu que vale perseguir comercialmente (com ou sem reunião marcada) |
| 2 | `Reunião agendada` | Reunião no calendário |
| 3 | `Diagnóstico` | Rodando diagnóstico / levantamento |
| 4 | `Proposta enviada` | Proposta entregue |
| 5 | `Negociação` | Ajuste de termos/preço |
| 6 | `Fechado` (Won) | Ganhou |
| 7 | `Perdido` (Lost) | Perdeu (preencher `Motivo da perda`) |

Isso fica quase 1:1 com os stages **recomendados na própria doc do Twenty** (New / Qualified / Meeting / Proposal / Negotiation / Closed Won / Closed Lost) — ficar perto do padrão reduz retrabalho.

### 9.3 Respostas diretas às perguntas do briefing

| Pergunta | Resposta | Classificação |
|---|---|---|
| Isso deve ser Stage da Opportunity? | Da "Reunião/Qualificado" em diante, **sim**. "Novo lead" e "Contato iniciado", **não** — são `Status` da Company. | 🔵 |
| Alguma etapa é Task/status, não stage? | "Novo lead" e "Contato iniciado" = `Status` da Company. "Diagnóstico" pode ser **Stage + uma Task "Rodar diagnóstico" + uma Note com o resultado**. | 🔵 |
| "Novo lead" deve existir antes da Opportunity? | **Sim** — vive na Company como `Status = Captado`. | 🔵 |
| Criar Opportunity para todo lead? | **Não.** Só quando há fit confirmado **ou** conversa comercial efetiva iniciada. Alinha com sua preferência de não poluir o pipeline. | 🔵 |
| Quando criar a Opportunity? (🟠 DECISÃO — D2) | **Recomendado:** no momento `Qualificado` (7 stages). **Alternativa mais conservadora:** só em `Reunião agendada` (6 stages, "Qualificado" fica só como `Status` da Company). | 🟠 |

### 9.4 Stage é campo Select customizável — 🟢 CONFIRMADO

O `Stage` da Opportunity é um Select editável em Settings → Data Model → Opportunities (adicionar/remover/renomear opções). O Kanban usa esse campo automaticamente para as colunas. Existe receita "Track time in stage" para medir tempo parado e "Detect stale opportunities".

---

## 10. Estratégia Company × Lead × Opportunity — 🔵 RECOMENDAÇÃO NORYOS

**A hipótese do briefing está correta e é a recomendação, com um ajuste de nomes.**

```
Empresa captada        →  Company com Status de prospecção ∈ {Captado, Em análise}
       ≠
Lead qualificado       →  Company com Status de prospecção ∈ {Contato iniciado, Qualificado}
       ≠
Opportunity            →  criada só quando: fit confirmado  OU  conversa comercial iniciada
```

**Regras operacionais:**

1. **Todo negócio do Kaptar vira Company** (com `Status = Captado`). Nunca vira Opportunity automaticamente.
2. **Triagem** (Rafael, manual, na view "Novos leads"): olha, decide `Prioridade` e move para `Em análise` ou `Não qualificado`.
3. **Contato**: ao iniciar abordagem, `Status → Contato iniciado` + cria Task "1º follow‑up" (+2 dias úteis). Ainda **sem Opportunity**.
4. **Opportunity nasce** quando (D2): há fit real confirmado ou reunião marcada. A partir daí o negócio vive no Kanban de Opportunity; a Company serve de cadastro.
5. **Fechou** → Opportunity `Stage = Fechado` **e** Company `Status = Cliente` (na Fase 2 isso vira workflow automático).
6. **Perdeu** → Opportunity `Stage = Perdido` + `Motivo da perda`. Company volta para `Em análise` (pode reciclar depois) ou `Não qualificado`.

**Por que não excluir lead ruim:** soft‑delete conta na unicidade e o reimport do Kaptar **restaura** o registro (L2). Manter como `Não qualificado` é mais seguro e ainda documenta a decisão.

---

## 11. Views recomendadas — 🔵 RECOMENDAÇÃO NORYOS

Poucas e úteis. **3 quadros de trabalho + 4 listas filtradas = 7 views.**

| # | View | Objeto | Tipo | Filtro / config |
|---|---|---|---|---|
| 1 | **Funil de prospecção** | Company | Kanban por `Status de prospecção` | Cobre "Novos leads", "Em prospecção" e "Clientes" num quadro só |
| 2 | **Pipeline comercial** | Opportunity | Kanban por `Stage` | O quadro principal. Opcional: esconder Fechado/Perdido com +30 dias |
| 3 | **Follow‑ups** | Task | Lista (ou Calendar) | Tasks abertas, ordenar por vencimento; recorte "esta semana" |
| 4 | Leads prioritários | Company | Table | `Prioridade = Alta` **e** `Status ∈ {Captado, Em análise, Contato iniciado}` |
| 5 | Propostas abertas | Opportunity | Table | `Stage ∈ {Proposta enviada, Negociação}` |
| 6 | Leads Kaptar | Company | Table | `Origem do lead = Kaptar` |
| 7 | Clientes | Company | Table | `Status de prospecção = Cliente` |

As views 1–3 são as essenciais para operar. As 4–7 são filtros de um clique — criar conforme a necessidade aparecer, não todas no dia 1.

Mapa contra a lista original do briefing: "Novos leads" e "Em prospecção" e "Clientes" = coluna da view 1 · "Leads prioritários" = view 4 · "Pipeline comercial" = view 2 · "Follow‑ups" = view 3 · "Propostas abertas" = view 5 · "Leads Kaptar" = view 6.

---

## 12. "Tipo de presença web" — 🔵 RECOMENDAÇÃO NORYOS

**Criar já na Fase 1. Como Select.** Justificativa: é um dos critérios que mais separa lead bom de lead ruim para a oferta "Sites e Presença Web", e o campo "Tem site" do Kaptar é enganoso (marca Instagram e página simplificada como site). Um Select força a classificação certa e vira filtro de priorização.

Opções (Select, single):

| Opção | API name sugerido |
|---|---|
| Site próprio | `site_proprio` |
| Página de rede/franquia | `pagina_rede_franquia` |
| Microsite/link page | `microsite_linkpage` |
| Instagram como site | `instagram_como_site` |
| Página simplificada | `pagina_simplificada` |
| Sem site | `sem_site` |
| Não analisado | `nao_analisado` |

Import do Kaptar entra tudo como **`nao_analisado`** (o "Tem site" do Kaptar não é confiável o suficiente para mapear direto). Rafael reclassifica na triagem — é rápido e é justamente a análise que gera a conversa de venda.

---

## 13. Estratégia de Tasks / follow‑up — 🔵 RECOMENDAÇÃO NORYOS

**Regra de ouro:** *toda Company em `Contato iniciado` e toda Opportunity aberta tem exatamente **uma** Task aberta — o próximo passo. Sem próxima Task = follow‑up perdido.*

**Cadência manual da Fase 1** (nada automatizado ainda):

| Momento | Ação no CRM |
|---|---|
| Import do Kaptar | **Não criar Task em massa.** Trabalhar a view "Novos leads" de cima para baixo. |
| Início de contato | `Status → Contato iniciado` + Task "1º follow‑up" (+2 dias úteis) |
| Sem resposta | Fechar a Task atual + nova Task "2º follow‑up" (+3 dias) |
| Reunião marcada | Criar Opportunity + Task "Rodar diagnóstico" na data da reunião |
| Pós‑reunião | Note com o diagnóstico + Task "Preparar proposta" (+2 dias) |
| Proposta enviada | `Stage → Proposta enviada` + Task "Follow‑up proposta" (+3 dias) → depois (+7) |
| Negociação | **Sempre** uma Task datada de próximo passo antes de sair da tela |
| Fechou/Perdeu | Fechar Tasks abertas; se perdeu, `Motivo da perda` |

**Verificação diária:** abrir a view "Follow‑ups" (Tasks vencendo hoje/atrasadas). Se aparecer Opportunity sem Task aberta na view "Pipeline comercial", criar uma na hora.

Automação disso é **Fase 2** (seção 16) — e é barata em crédito porque são passos padrão.

---

## 14. Estratégia de deduplicação — 🔵 RECOMENDAÇÃO NORYOS (crítica)

### 14.1 O que o Twenty faz — 🟢 CONFIRMADO

- Casa só em **campo marcado como único**, valor **exato**. Sem fuzzy, sem "revisar possíveis duplicatas" (GitHub issue #17457).
- Se o valor único do CSV casa com registro existente → **atualiza** aquele registro (não duplica).
- Recomendado casar **um único** campo por import.
- Nativos únicos: Company = `id`, `domain`. Custom field pode virar único.
- Soft‑delete conta na unicidade e é restaurado por reimport (L2).

### 14.2 O problema Noryos

O mesmo estabelecimento aparece no Kaptar em buscas/raios/cidades/nichos diferentes. Sinais disponíveis, em ordem de confiabilidade:

1. **Google Place ID** — identificador único do estabelecimento. **MAS:** não assumir que o Kaptar exporta o Place ID em coluna própria. Às vezes está embutido na URL do Google Maps, às vezes não.
2. **Domínio** — confiável **quando existe site próprio real**. Inútil para "sem site" / "Instagram como site" (boa parte do público‑alvo).
3. **Telefone** — arriscado: rede/franquia compartilha número, formatação varia.
4. **Nome + cidade/UF** — último recurso, sujeito a colisão ("Auto Center Silva" em duas cidades).

### 14.3 Recomendação: chave sintética `dedupeKey`, montada **fora** do Twenty

No passo de preparo do CSV (planilha ou script — Fase 1 é manual), gerar **uma** coluna `dedupeKey` por regra de precedência:

```
se  Place ID disponível        → dedupeKey = "gplace:" + place_id
senão se domínio real          → dedupeKey = "domain:" + domínio normalizado (minúsculo, sem www/protocolo)
senão se telefone              → dedupeKey = "phone:"  + só dígitos, com DDI 55
senão                          → dedupeKey = "namecity:" + slug(nome) + "|" + slug(cidade) + "|" + UF
```

- `dedupeKey` é **custom field Text, Unique** na Company.
- Import sempre casa por `dedupeKey` → reimport do mesmo negócio **atualiza**, não duplica.
- A regra fica **sob controle da Noryos** (não depende de matching do Twenty) e evolui sem migração: quando o Kaptar passar a entregar Place ID confiável, é só recomputar a chave dos registros afetados via API na Fase 3.
- **Manter também** a URL do Google Maps no campo `Google Maps` desde já — é a matéria‑prima para extrair Place ID depois.

**Futuro (Fase 3):** quando houver Place ID de verdade, promover para um campo `Place ID` (Text, Unique) dedicado como identificador externo do estabelecimento, mantendo `dedupeKey` como fallback. 🟠 DECISÃO D7: criar o campo `Place ID` já agora (vazio) ou só na Fase 3.

### 14.4 Teste obrigatório antes de importar em escala

Importar um lote pequeno (20–50 linhas), depois **reimportar o mesmo arquivo** e confirmar que o Twenty **atualizou** os 20–50 (contagem de Companies não muda) em vez de duplicar. Só depois liberar o import cheio.

---

## 15. Riscos de importação — 🟢 CONFIRMADO / 🔵 mitigação

| Risco | Detalhe | Mitigação |
|---|---|---|
| **CSV do Kaptar não entra cru** | Vírgula decimal (Avaliação "4,7"), telefone junto, acento | Passo de transformação: ponto decimal; telefone em `número / country code (BR) / calling code (+55)`; garantir UTF‑8 |
| **Select por rótulo falha** | Twenty espera o **API name** da opção | Planilha de‑para (rótulo → api_name) para `Segmento`, `Status`, `Prioridade`, `Tipo de presença web`, `Origem`, `Oferta`, `Tipo de contato` |
| **Campo inexistente** | Import não cria campo | Criar **todos** os custom fields antes do 1º import |
| **Ordem de import** | Companies antes de People antes de Opportunities | Importar Companies primeiro; People num 2º arquivo referenciando `domain`/`dedupeKey` |
| **Relação por 2 chaves** | Mapear só **uma** (ex: `companyDomain` **ou** `companyId`, não os dois) | Padronizar em `dedupeKey` |
| **Teto de 10.000 linhas** | Por arquivo CSV | Fatiar pulls grandes |
| **Duplicata dentro do arquivo** | Destacada em amarelo, editável antes de confirmar | Revisar a tela de validação, não pular |
| **Registro excluído "ressuscita"** | Soft‑delete conta na unicidade | Não excluir desqualificado; usar `Status = Não qualificado` |
| **Campo enriquecido tratado como verdade** | "WhatsApp provável", "Tem site", "Responsável" do Kaptar | Nomes já sinalizam incerteza; `Tipo de presença web` entra "não analisado"; `Tipo de contato` entra "desconhecido" |
| **Encoding** | Acento quebrado se não for UTF‑8 | Salvar/exportar o CSV como UTF‑8; validar no lote de teste |
| **Resumo IA do Kaptar** | Campo grande, não estruturado, não verificado | **Não** importar como campo. Se útil, colar numa Note. Melhor: só importar o que tem uso comercial. |

---

## 16. Workflows futuros — 🔵 RECOMENDAÇÃO (Fase 2) / 🟢 viabilidade

**Não configurar nada na Fase 1.** Definir o processo manual primeiro (seção 13), observar o uso real, e só então automatizar o que doer.

**Custo (🟢 CONFIRMADO):** passo padrão de workflow = ~US$ 0,0001 (~10.000 execuções por crédito). Com 50 créditos/ano, os workflows abaixo são **efetivamente gratuitos** — todos usam só passos padrão (buscar/criar/atualizar registro, enviar e‑mail). O que queima crédito é **IA** (agent, busca web), que **não** entra nestes.

**Candidatos Fase 2 (todos mapeiam receitas oficiais do Twenty):**

| Workflow | Gatilho | Ação | Base oficial |
|---|---|---|---|
| Follow‑up de proposta | Opportunity `Stage → Proposta enviada` | Criar Task "Follow‑up proposta" (+3 dias) | "Send email alerts with tasks due" |
| Fechou → vira cliente | Opportunity `Stage → Fechado` | Company `Status → Cliente` | "Closed Won Automations" |
| Oportunidade parada | Cron diário | Opportunity sem Task aberta e `Stage` não‑fechado → e‑mail para o Rafael | "Detect stale opportunities" |
| Lead esquecido | Cron diário | Company `Status = Contato iniciado` há >7 dias sem Task aberta → sinalizar | "Detect stale opportunities" (adaptado) |
| Perdido sem motivo | Opportunity `Stage → Perdido` e `Motivo da perda` vazio | Criar Task "Preencher motivo da perda" | — |

**Regra de crédito:** nunca colocar AI agent em loop/cron sem monitorar o medidor (Settings → Billing). Comprar pacote extra se necessário — não é bloqueante.

---

## 17. Integração futura por API — 🔵 RECOMENDAÇÃO (Fase 3) / 🟢 viabilidade

**Não configurar nada agora.** Só garantir que a Fase 1 não bloqueia isto — e não bloqueia.

**Arquitetura futura:**

```
Kaptar (API)
  → middleware Noryos (n8n ou serviço Node pequeno)
      · normalização + cálculo do dedupeKey
      · (Fase 4) scoring / auditoria / oferta recomendada
  → Twenty  (GraphQL batch upsert, casando por dedupeKey único)
```

- 🟢 API REST + GraphQL, auth por API key escopada a papel. Rate limit Pro 50 req/min, lote 60 registros → ~3.000 registros/min efetivos: folgado para volume Kaptar.
- 🟢 **Metadata API** permite versionar o schema como código (opcional — dá para configurar tudo na UI na Fase 1 e só depois "codificar").
- 🟢 GraphQL `batch upsert` + campo único = update‑or‑create nativo, sem lógica de dedup no cliente além de calcular a chave.
- 🟢 Webhooks Twenty → middleware para o sentido inverso (ex: mudança de Stage dispara ação externa).
- **Sem lock‑in:** tudo que a integração precisa existe via API pública. Apps são opcionais.

---

## 18. MCP / IA futuro — 🔵 RECOMENDAÇÃO / 🟢 (existência) 🟠 (detalhe)

**Não conectar agora.** Documentar e propor fase futura.

- 🟢 Servidor **MCP nativo** existe no plano Pro (página de preços: "MCP server: Yes"). Autenticação por API key.
- 🟠 Documentação oficial detalhada é rasa — validar capacidades na mão antes de depender. Existem também servidores MCP comunitários (`mhenry3164/twenty-crm-mcp-server`, `jezweb/twenty-mcp`) como referência/alternativa.
- Uso pretendido (consultas em linguagem natural): *"quais leads de odontologia de alta prioridade ainda não foram contatados?"*, *"quais propostas estão paradas há mais de 7 dias?"*.
- **Quando:** habilitar em modo **somente leitura** (API key com papel read‑only) já na Fase 2 é baixo risco e alto valor para o Rafael. Escrita/automação via MCP fica para a Fase 5.
- 🟢 A IA do Twenty respeita o modelo de permissão — a key read‑only limita o alcance de qualquer agente.

---

## 19. Considerações de LGPD — 🔵 RECOMENDAÇÃO

Não construir "módulo LGPD" agora. Mas o modelo de dados já nasce responsável:

| Princípio | Como o modelo atende |
|---|---|
| **Minimização** | Só campos com uso comercial. Resumo/enriquecimento IA do Kaptar **não** é importado como campo. Person entra com o mínimo (nome, contato, `Tipo de contato = Desconhecido`). |
| **Registro de origem** | `Origem do lead` + `Data de captura` em toda Company. |
| **Base legal** | Prospecção B2B de dados públicos de empresa: legítimo interesse. Contato com pessoa física nomeada só com base — por isso o padrão `Tipo de contato = Desconhecido` e nada de e‑mail automático para contato não qualificado. |
| **Dado enriquecido ≠ verdade** | `WhatsApp provável`, `Tipo de presença web = não analisado`, `Tipo de contato = desconhecido` — os nomes e defaults sinalizam incerteza. |
| **Direito de exclusão** | Possível a qualquer momento. **Atenção:** soft‑delete conta na unicidade e reimport restaura (L2) → erasure de verdade = *Destroy* + remover do fluxo de reimport do Kaptar. |
| **Retenção** | Revisão trimestral: lead sem nenhuma interação em 12–18 meses → anonimizar ou *Destroy*. |
| **Operador de dados** | Twenty Cloud é operador; sub‑operador é o provedor de hospedagem deles. Pro **não** inclui log de auditoria nem DPA formal (Organization inclui). Aceitável no estágio atual; reavaliar na escala. |
| **Região de dados** | 🟠 DECISÃO D10 — verificar no checkout/contato com o Twenty se há opção de região (EU/US) e se isso importa para a Noryos. |

---

## 20. Considerações de licença — 🟢 CONFIRMADO / 🔵 princípio

- **Core: AGPL‑3.0.** SDKs, `twenty-ui`, `packages/twenty-apps`: **MIT**. Arquivos `/* @license Enterprise */`: licença comercial (produção exige assinatura).
- **Princípio Noryos (inegociável nesta fase):**
  - Não fazer fork do Twenty.
  - Não alterar o core.
  - Não criar dependência de modificação interna.
  - Extensão **apenas** por: configuração (UI), API REST/GraphQL, Webhooks, framework de Apps (SDK MIT).
- Consequência: como não há distribuição de software modificado, as obrigações de *copyleft* do AGPL **não são acionadas** para o uso da Noryos. E o caminho de upgrade continua limpo (nada para fazer *merge* a cada release).

---

## 21. Cloud × self‑hosting — 🟢 CONFIRMADO / 🔵 recomendação

### 21.1 O que o self‑hosting exige — 🟢 CONFIRMADO

| Componente | Observação |
|---|---|
| PostgreSQL | Banco primário |
| Redis | Fila do worker (BullMQ) — necessário no stack real |
| server | Backend da aplicação |
| worker | Jobs de fundo: import de e‑mail, sync de calendário, gatilho de workflow, cron |
| Storage | Filesystem local por padrão; **S3 / compatível** para produção (persistir entre restarts) |
| Proxy/TLS + DNS | Reverse proxy, certificado; wildcard DNS se multi‑workspace |
| Segredos | `ENCRYPTION_KEY` (perder = perder todo segredo do banco), `FALLBACK_ENCRYPTION_KEY`, `PG_DATABASE_PASSWORD`, `SERVER_URL` |
| Recursos | Mínimo 2 GB RAM (realista: 4 GB+) |

### 21.2 Custo operacional real do self‑host

- **Upgrades ~semanais** com migração de banco — cada um é risco e janela de manutenção.
- **Backups são seus** — dump do Postgres + storage, testados, off‑site.
- **Custódia da `ENCRYPTION_KEY`** — perda é catastrófica e irreversível.
- Monitoramento, TLS, registro de jobs cron no worker, patch de SO.
- Estimativa honesta: **algumas horas/mês + risco de upgrade**, mesmo num VPS de US$ 10–20/mês.

### 21.3 Comparação

| | Cloud Pro (1 user) | Self‑host |
|---|---|---|
| Custo direto | ~US$ 81–108/ano | ~US$ 120–240/ano de VPS |
| Custo de tempo | ~zero | horas/mês + risco |
| Backup | rotina manual de export (L6) | responsabilidade total |
| Upgrades | gerenciados | manuais, semanais |
| Row‑level / audit log | não (só Organization) | disponível no core, mas você opera |
| Time to value | minutos | dias |

### 21.4 Recomendação — 🔵

**Cloud Pro agora. Self‑host só se aparecer uma razão objetiva:** (a) exigência contratual/LGPD de dado numa jurisdição que o Cloud não oferece; (b) necessidade de row‑level security sem pagar Organization; (c) uso pesado de Apps/IA em que se queira controlar custo de compute; (d) 5–10+ assentos, onde o custo por assento composto justifica. **Nenhuma se aplica hoje.**

**Sem lock‑in:** migração Cloud → self‑hosted e self‑hosted → Cloud são documentadas. Portabilidade de dados por CSV (20k/arquivo) + GraphQL (sem limite). Único cuidado: **não existe backup total em 1 clique no Cloud** — montar a rotina de export desde o início.

---

## 22. Roadmap por fases — 🔵 RECOMENDAÇÃO NORYOS

| Fase | Escopo | Entregas | Pré‑requisito |
|---|---|---|---|
| **0 — Descoberta** *(esta)* | Arquitetura + decisões | Este relatório | Aprovação do Rafael |
| **1 — CRM funcional mínimo** | Workspace Cloud Pro (trial); objetos nativos; ~17 custom fields; pipeline 7 stages; 3 quadros + 4 listas; SOP de follow‑up manual; import manual de CSV do Kaptar (com teste de dedup); operação comercial manual | CRM operando; 1º lote Kaptar importado; Rafael prospectando | Decisões D1–D11 |
| **2 — Melhoria operacional** | Ajustes conforme uso real; 3–5 workflows padrão (seção 16); sync de e‑mail + calendário (com aprovação); 1 dashboard de pipeline; MCP read‑only | Menos follow‑up perdido; visão de funil | 2–4 semanas de uso real da Fase 1 |
| **3 — Integração** | Kaptar API → middleware (n8n/Node) → Twenty GraphQL; `dedupeKey` calculado no middleware; campo `Place ID` dedicado; webhooks | Import sem CSV manual; dedup robusta | Volume que justifique parar o CSV manual |
| **4 — Inteligência Noryos** | Digital Gap Score; Commercial Fit Score; Opportunity Score; auditoria de presença; oferta recomendada — calculados no middleware e gravados via API | Priorização automática de lead | Base de leads reais suficiente para calibrar |
| **5 — Noryos Commercial Intelligence (App)** | App próprio no Twenty (TypeScript/SDK MIT): import Kaptar, scoring, auditoria, enrichment, dashboards, automações avançadas, MCP de escrita | Produto interno de inteligência comercial | Fases 3–4 validadas; framework de Apps maduro |

**Critério de sucesso (não mudar):** *"Rafael consegue captar leads, importar, priorizar, fazer contato, marcar reunião, enviar proposta e acompanhar follow‑up sem perder oportunidade."* Qualquer customização que não sirva a isso **agora** → adiar.

---

## 23. Checklist para configuração (Fase 1) — 🔵 executar só após aprovação

> Estimativa: ~4–6 h de configuração + preparo do 1º CSV.

**A. Workspace**
1. Criar conta no Twenty, iniciar trial de 30 dias (sem cartão).
2. Nome do workspace + subdomínio (🟠 D11, ex: `noryos.twenty.com`).
3. Locale **pt‑BR**, moeda **BRL**, timezone **America/Sao_Paulo**.
4. Manter papel Admin padrão (1 usuário). **Não** criar API key ainda.

**B. Data model — Company**
5. Criar os custom fields da seção 7 (Company). Definir opções dos 5 Selects.
6. Marcar `dedupeKey` como **Unique**.
7. Confirmar se Company tem Phone nativo (L9); se não, manter `Telefone principal`.
8. (🟠 D7) Decidir se cria `Place ID` (Text, Unique) já agora.

**C. Data model — Person e Opportunity**
9. Person: criar `Tipo de contato` (Select).
10. Opportunity: configurar as 7 opções de `Stage` (seção 9.2); criar `Oferta` (Select) e, se aprovado, `Motivo da perda` (Select).
11. Configurar `Amount` da Opportunity para BRL.

**D. API names**
12. Ativar **Advanced mode**; anotar numa planilha o API name de cada objeto e de **cada opção de Select** (necessário para o CSV).

**E. Views**
13. Criar as 3 essenciais: "Funil de prospecção" (Company Kanban por Status), "Pipeline comercial" (Opportunity Kanban por Stage), "Follow‑ups" (Task por vencimento). Demais conforme necessidade.

**F. Import Kaptar (1º lote)**
14. Montar a planilha/script de preparo: UTF‑8; ponto decimal; telefone em 3 colunas; mapear rótulo → API name; **calcular `dedupeKey`** pela regra da seção 14.3; `Tipo de presença web = nao_analisado`; `Tipo de contato = desconhecido`.
15. Mapa de colunas Kaptar → Twenty conforme seção final (24 / apêndice).
16. Importar **lote de teste (20–50 linhas)**. Conferir campos, acentos, Selects.
17. **Reimportar o mesmo arquivo** → confirmar update (contagem de Companies não muda). Só então liberar o import cheio.
18. Importar People num 2º arquivo, referenciando a Company por `dedupeKey` (ou `domain`).

**G. Processo**
19. Escrever o SOP de follow‑up de 1 página (seção 13) e deixar no `projetos/Noryos-Inovacoes/crm/`.
20. Definir antes do dia 30 do trial: converter para pago (🟠 D1, anual recomendado).

---

## 24. Decisões que dependem de você — 🟠 DECISÃO PENDENTE

> Só o que precisa ser resolvido **antes de configurar**. Recomendação da Noryos em **negrito**.

| ID | Decisão | Opções | Recomendação |
|---|---|---|---|
| **D1** | Plano e billing | Cloud Pro anual (−25%, 50 créditos/ano) · Cloud Pro mensal (cheio, 5/mês) | **Pro anual**, decidido antes do fim do trial |
| **D2** | Quando nasce a Opportunity | (a) em `Qualificado` — 7 stages · (b) só em `Reunião agendada` — 6 stages | **(a) `Qualificado`, 7 stages** (fica 1:1 com o padrão do Twenty) |
| **D3** | Valores de `Status de prospecção` (Company) | Lista proposta: Captado · Em análise · Contato iniciado · Qualificado · Não qualificado · Cliente | **Aprovar a lista** (ou ajustar nomes) |
| **D4** | Lista de custom fields da Fase 1 (seção 7) | Aprovar / enxugar | **Aprovar**; cortáveis sem prejuízo: `Facebook`, `WhatsApp provável`, `Google Maps` |
| **D5** | `Segmento` | Select com buckets fixos · Text livre | **Select** (Odontologia · Estética · Oficina · Autopeças/Motopeças · Comércio local · Serviços locais · Outro) |
| **D6** | `Oferta` (Opportunity) | Select único · Multi‑Select | **Select único** + opção "Combinação" |
| **D7** | `Place ID` dedicado | Criar já (vazio) · só na Fase 3 | **Só na Fase 3** — `dedupeKey` cobre agora; manter `Google Maps` preenchido desde já |
| **D8** | Locale / moeda | pt‑BR / BRL / America/Sao_Paulo | **Confirmar** |
| **D9** | Assentos | Só Rafael agora · já prever 2º usuário | **1 assento** (afeta só custo; adicionar depois é trivial) |
| **D10** | Região de dados (LGPD) | Sem exigência · exigir EU/BR | **Verificar** opções de região com o Twenty; provável "sem exigência" no estágio atual |
| **D11** | Subdomínio do workspace | ex: `noryos.twenty.com` / `noryosinovacoes.twenty.com` | **Definir o nome** |
| **D12** | Sync de e‑mail/calendário | Conectar na Fase 1 · só na Fase 2 · não conectar | **Fase 2**, e só com sua aprovação explícita na hora |

---

## 25. Riscos / GAPs encontrados

| ID | Risco / GAP | Sev. | Classificação | Mitigação |
|---|---|---|---|---|
| G1 | Sem dedup fuzzy no import CSV (só campo único exato) | Alta | 🟢 | `dedupeKey` sintética montada no preparo (seção 14) |
| G2 | Soft‑delete conta na unicidade → reimport restaura registro excluído | Média | 🟢 | Não excluir desqualificado; usar `Não qualificado`. Erasure = *Destroy* + tirar do reimport |
| G3 | Select no CSV exige API name, não rótulo → erro silencioso | Média | 🟢 | Planilha de‑para de API names antes do 1º import |
| G4 | Dado BR (vírgula decimal, telefone, acento) não entra cru | Alta | 🟢 | Passo de transformação + lote de teste |
| G5 | Teto de 10.000 linhas/arquivo no import | Baixa | 🟢 | Fatiar pulls do Kaptar |
| G6 | Sem backup total em 1 clique no Cloud; export 20k/arquivo | Média | 🟢 | Rotina mensal: export por objeto + GraphQL; lembrete no calendário |
| G7 | Pro sem log de auditoria e sem row‑level permission | Baixa (agora) | 🟢 | Aceitável com 1 operador; reavaliar no 2º usuário / escala |
| G8 | Créditos: IA queima rápido (agent grande = US$ 1+); pool único | Média (Fase 4–5) | 🟢 | Sem IA em loop; monitorar medidor; comprar pacote se preciso |
| G9 | Company pode não ter Phone nativo | Média | 🟠 verificar | Custom field `Telefone principal` (Phone) |
| G10 | Tipo de campo imutável após criação | Média | 🟢 | Tipos decididos neste doc; se errar: campo novo + migrar + desativar |
| G11 | Apps framework novo (v2.0, abr/2026), em evolução | Baixa | 🟢 | Só Fase 5; não apostar Fase 1–2 |
| G12 | MCP: doc oficial rasa | Baixa | 🟢/🟠 | Validar na mão; começar read‑only |
| G13 | Kaptar pode não exportar Place ID em coluna própria | Média | 🔵 hipótese | `dedupeKey` com precedência (Place ID → domínio → telefone → nome+cidade); extrair Place ID da URL do Maps na Fase 3 |
| G14 | Não existe objeto "Meeting" de 1ª classe | Baixa | 🟢 | Reunião = evento de calendário + Note. Diagnóstico = Note estruturada. Compatível com o modelo conceitual do briefing |
| G15 | "Responsável" do Kaptar não é o decisor | Média | 🔵 | `Tipo de contato = Desconhecido` por padrão; nunca inferir decisor |
| G16 | API 50 req/min no Pro (100 no Org) | Baixa | 🟢 | Lotes de 60 → suficiente para volume Kaptar na Fase 3 |
| G17 | Divergência de doc sobre créditos em blogs de terceiros ("5 milhões/mês") | Baixa | 🟢 | Fonte oficial vale: 5/mês ou 50/ano. Ignorar teardown de terceiros |

---

## Apêndice — Mapeamento Kaptar CSV → Twenty — 🔵 RECOMENDAÇÃO (validar API names no setup)

**Objeto: Company** (1º arquivo de import)

| Coluna Kaptar | Campo Twenty | Tipo | Transformação no preparo |
|---|---|---|---|
| Nome | `Name` | Text (nativo) | trim |
| Site | `Domain Name` | Domain (nativo) | normalizar: minúsculo, sem `http(s)://`, sem `www.`, sem path. Vazio se for URL de Instagram/Facebook |
| Tem site | *(não importar)* | — | usado só para ajudar a preencher `Tipo de presença web` manualmente depois |
| Nicho | `Segmento` | Select | mapear para bucket Noryos (de‑para) → API name; sem match → `outro` |
| Telefone | `Telefone principal` | Phone | só dígitos; separar em número / `BR` / `+55` |
| WhatsApp provável | `WhatsApp provável` | Phone | idem; **não** tratar como validado |
| Cidade | `Address` (city) | Address (nativo) | — |
| Estado | `Address` (state) | Address (nativo) | UF |
| Instagram | `Instagram` | Links | `[{"url":"...","label":"Instagram"}]` |
| Facebook | `Facebook` | Links | idem |
| E‑mail | `Emails`? *(ver nota)* | — | e‑mail de empresa: pode ir para uma Note ou para um custom `E‑mail da empresa` (Email). E‑mail nativo é da Person. 🟠 decidir no setup |
| Google Maps | `Google Maps` | Links | URL crua (matéria‑prima do Place ID) |
| Score | `Kaptar Score` | Number | inteiro |
| Avaliação | `Avaliação Google` | Number | **ponto** decimal (4,7 → 4.7) |
| Nº avaliações | `Nº de avaliações Google` | Number | inteiro |
| Fonte | `Origem do lead` | Select | normalmente `kaptar` |
| Encontrado em | `Data de captura` | Date | `YYYY-MM-DD` |
| Responsável | *(vai para Person)* | — | ver abaixo |
| Resumo | *(não importar como campo)* | — | opcional: colar numa Note |
| *(calculado)* | `dedupeKey` | Text · **Unique** | regra de precedência da seção 14.3 |
| *(fixo)* | `Status de prospecção` | Select | `captado` |
| *(fixo)* | `Prioridade` | Select | `nao_avaliado` |
| *(fixo)* | `Tipo de presença web` | Select | `nao_analisado` |

**Objeto: Person** (2º arquivo, só quando há nome de responsável real)

| Coluna Kaptar | Campo Twenty | Transformação |
|---|---|---|
| Responsável | `First name` / `Last name` | split no 1º espaço; se vazio, **não criar Person** |
| *(relação)* | `Company` | referenciar por `dedupeKey` (ou `domain`) — **uma** chave só |
| E‑mail | `Emails` | se for claramente pessoal |
| Telefone / WhatsApp | `Phones` | se específico da pessoa |
| *(fixo)* | `Tipo de contato` | `desconhecido` |
| Fonte | *(herda da Company)* | — |

**Opportunity:** **não** importar do Kaptar. Criada manualmente por decisão comercial (seção 10).

---

## Fontes (consultadas em 08/09/2026)

- Preços e limites: https://twenty.com/pricing · https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans · https://docs.twenty.com/user-guide/billing/capabilities/credits
- Créditos de workflow: https://docs.twenty.com/user-guide/workflows/capabilities/workflow-credits
- Data model / campos / objetos: https://docs.twenty.com/user-guide/data-model/capabilities/objects · .../fields · .../relation-fields · .../how-tos/data-model-faq
- Importação / dedup: https://docs.twenty.com/user-guide/data-migration/overview · .../capabilities/uniqueness-constraints · .../how-tos/prepare-your-csv-files · .../how-tos/update-existing-records-via-import · .../how-tos/export-your-data · GitHub issue #17457
- Pipeline / views: https://docs.twenty.com/user-guide/views-pipelines/how-tos/set-up-a-sales-pipeline · .../capabilities/kanban-views · .../how-tos/track-time-in-stage
- Workflows: https://docs.twenty.com/user-guide/workflows/overview · .../how-tos/crm-automations/* (closed-won, detect-stale-opportunities, send-email-alerts-with-tasks-due)
- API / webhooks: https://docs.twenty.com/developers/extend/api · https://docs.twenty.com/developers/extend/webhooks
- Apps / MCP / IA: https://docs.twenty.com/getting-started/core-concepts/apps · .../ai · https://docs.twenty.com/developers/extend/apps/getting-started/concepts · https://twenty.com/releases (v2.0.0, v2.18.0, v2.26.0)
- E‑mail / calendário: https://docs.twenty.com/getting-started/core-concepts/calendar-and-email
- Permissões: https://docs.twenty.com/user-guide/permissions-access/capabilities/permissions
- Self‑hosting: https://docs.twenty.com/developers/self-host/capabilities/docker-compose · .../setup
- Licença: https://github.com/twentyhq/twenty/blob/main/LICENSE
- Índice completo da doc: https://docs.twenty.com/llms.txt

---

*Fim do relatório de descoberta. Nada implementado. Aguardando aprovação das decisões D1–D12 antes de qualquer configuração.*
