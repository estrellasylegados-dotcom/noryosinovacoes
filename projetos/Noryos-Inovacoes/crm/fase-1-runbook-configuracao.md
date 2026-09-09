# Twenty CRM — Fase 1: Runbook de Configuração (execução guiada)

> **Decisões aprovadas:** D1–D12 conforme mensagem do Rafael de 08/09/2026. Este runbook é a execução dessas decisões.
> **Como usar:** seguir bloco a bloco, tela a tela. Não pular etapas. Cada bloco tem um ponto de checagem ("✅ Confirmar") antes de seguir.

---

## A. O que é ação sua (Rafael) e o que é ação minha (Claude)

**Não consigo operar a interface do Twenty Cloud.** Não tenho navegador, login nem acesso ao workspace. Twenty Cloud é SaaS hospedado — **toda** criação de conta, clique, campo e view é feita por você no navegador. O que eu faço:

| Eu (Claude) faço | Você (Rafael) faz |
|---|---|
| Este runbook (onde clicar / o que preencher / qual valor) | Criar a conta e o workspace |
| Preparar o CSV piloto normalizado a partir do seu export do Kaptar | Executar cada bloco na interface |
| Montar o de‑para de valores dos Selects | Rodar o import piloto e os testes |
| Compilar o relatório final de validação a partir do que você observar | Reportar o que viu em cada checagem |
| Analisar diferenças entre a documentação e o workspace real que você encontrar | Decidir contratar o Pro anual ao final |

**Regra de parada (você definiu):** se um passo pedir pagamento, cartão, conexão Gmail/Calendar, API key, MCP, OAuth, alteração no site, código, Git ou servidor → **eu paro e te aviso antes.** Já há um ponto assim no Bloco 0 (criação de conta).

---

## B. Bloco 0 — Criar conta e workspace

> **⛔ REGRA DE PARADA ACIONADA:** este bloco exige criar uma conta. Não precisa de cartão (o trial Pro de 30 dias não pede). **Faça o cadastro com e‑mail + senha, NÃO com "Continue with Google"** — o login Google é o fluxo OAuth que você pediu para eu parar antes. Só siga quando você confirmar que quer criar a conta.

### Tela 0.1 — Cadastro
1. Abrir **https://twenty.com** → botão **"Get started"** (ou **"Start free trial"**).
2. Escolher **e‑mail + senha** (não usar o botão do Google).
3. E‑mail sugerido: o e‑mail comercial da Noryos que você já usa para o negócio. Confirmar o e‑mail se pedirem.

### Tela 0.2 — Criação do workspace
| Campo | Valor (D8–D11) |
|---|---|
| Workspace name | **Noryos Inovações** |
| Subdomínio / slug | **noryos** → resultado esperado `noryos.twenty.com` |
| Se `noryos` estiver indisponível | **PARE aqui e me diga.** Alternativas na ordem: `noryos-crm`, `noryosinovacoes`, `noryos-inovacoes`, `noryosos`. Não escolher nada muito diferente sem me consultar. |
| Custom domain | **Não configurar** (D11) |

### Tela 0.3 — Região dos dados (D10)
- Durante a criação, **anote qual(is) região(ões) de dados o Twenty oferece** (ex: US, EU) e qual ficou selecionada.
- Se só houver uma opção, anote qual é. **Não travar a Fase 1 por isso** — é para documentar no relatório final.
- Me reporte: "Região oferecida: ___ / Região escolhida: ___".

### Tela 0.4 — Idioma
- Settings → **Experience** (ou no onboarding): idioma **Português (Brasil)** se disponível; senão English e trocamos depois.

**✅ Confirmar antes de seguir:** workspace criado, você consegue logar em `https://<slug>.twenty.com`, e você me mandou: slug final + região oferecida/escolhida + idioma disponível.

---

## C. Bloco 1 — Configurações gerais

Menu: canto inferior esquerdo → **Settings** (ícone de engrenagem) ou `Ctrl/Cmd + K` → "Settings".

### Tela 1.1 — Workspace / Geral
- **Settings → General** (ou "Workspace"): confirmar nome **Noryos Inovações**. Logo: opcional, pode subir o `noryos-icon.png` do projeto depois.

### Tela 1.2 — Idioma, moeda e fuso (D8)
- **Settings → Experience**:
  - Language / Idioma: **Português (Brasil)**
  - Date format: **DD/MM/YYYY** (ou o padrão BR disponível)
  - Time zone / Fuso: **America/Sao_Paulo (GMT‑3)**
- **Moeda padrão BRL:** definida no campo `Amount` da Opportunity (Bloco 4). Se houver um "Default currency" global em Settings, setar **BRL (R$)**.

### Tela 1.3 — Advanced mode (necessário para os próximos blocos)
- **Settings → Experience → "Advanced"** (toggle **Advanced mode: ON**).
- Isso faz aparecer os **API names** dos objetos, campos e opções de Select — vamos precisar deles para preparar o CSV.

**✅ Confirmar:** idioma pt‑BR aplicado, fuso America/Sao_Paulo, Advanced mode ON.

---

## D. Bloco 2 — Company: campos customizados

Menu: **Settings → Data Model → Companies**.

Para **cada** campo abaixo:
1. Clicar **"+ New Field"** (ou o **+** no cabeçalho de coluna na tabela de Companies → "Customize fields").
2. Escolher o **tipo**.
3. Preencher **Name** exatamente como na coluna "Nome do campo".
4. Em Select, adicionar as opções com **"+ Add option"**, na ordem listada.
5. Onde a coluna "Unique" disser **SIM**, ativar o toggle **"Unique"**.
6. **Save**.
7. Com Advanced mode ON, **anotar o API name** que o Twenty gerou para o campo e para cada opção (vou precisar para o CSV).

> **Company não tem campo de telefone nativo** (confirmado no código‑fonte do Twenty). Por isso `Telefone principal` é campo customizado.

### Campos a criar (15)

| # | Nome do campo | Tipo | Unique | Opções (na ordem) |
|---|---|---|---|---|
| 1 | `Segmento` | Select | não | Odonto · Estética · Oficina · Autopeças/Motopeças · Comércio local · Serviços locais · Outro |
| 2 | `Telefone principal` | Phone | não | — |
| 3 | `WhatsApp provável (Kaptar)` | Phone | não | — *(nome já sinaliza: NÃO é WhatsApp verificado)* |
| 4 | `Origem do lead` | Select | não | Kaptar · Indicação · Inbound (site) · Prospecção manual · Evento · Outro |
| 5 | `Data de captura` | Date | não | — |
| 6 | `Status de prospecção` | Select | não | Captado · Em análise · Contato iniciado · Qualificado · Não qualificado · Cliente |
| 7 | `Prioridade` | Select | não | Alta · Média · Baixa · Não avaliado |
| 8 | `Tipo de presença web` | Select | não | Site próprio · Página de rede/franquia · Microsite/link page · Instagram como site · Página simplificada · Sem site · Não analisado |
| 9 | `Kaptar Score` | Number | não | — (inteiro) |
| 10 | `Avaliação Google` | Number | não | — (permitir decimais) |
| 11 | `Nº de avaliações Google` | Number | não | — (inteiro) |
| 12 | `Google Maps` | Links | não | — (URL do Kaptar) |
| 13 | `Instagram` | Links | não | — |
| 14 | `Google Place ID` | Text | **SIM** | — (só preencher se houver Place ID real `ChIJ…`; ver Bloco 7) |
| 15 | `Chave de dedup` | Text | **SIM** | — (`dedupeKey` — gerada na normalização do CSV, Bloco 7) |

**Opcional recomendado (decisão sua):**

| 16 | `Google CID` | Text | não | Identificador do estabelecimento que **dá para extrair da URL do Google Maps** (o Place ID `ChIJ…` normalmente **não** dá — ver Bloco 7). Se você não quiser mais um campo, pulamos e a dedup usa só a chave sintética + domínio/telefone. |

**Removido da Fase 1 (D4):** `Facebook` — sem função operacional relevante agora. Entra na Fase 2 se virar canal de contato.

**NÃO criar (usar nativo):** Nome da empresa (`Name`), site/domínio (`Domain Name`), cidade/estado/endereço (`Address`), responsável Noryos (`Account Owner`), LinkedIn (`Linkedin`). Resumo do Kaptar → **Note** anexada, não campo.

**✅ Confirmar:** 15 (ou 16) campos criados em Companies. Me mandar a **lista de API names** gerados (campo → api_name, e para os Selects: opção → api_name).

---

## E. Bloco 3 — Person: campo customizado

Menu: **Settings → Data Model → People**.

| # | Nome do campo | Tipo | Opções (na ordem) |
|---|---|---|---|
| 1 | `Tipo de contato` | Select | Proprietário · Sócio · Gerente · Decisor · Contato comercial · Responsável técnico · Desconhecido |

Nativo do Person (não criar): `First name`, `Last name`, `Emails`, `Phones`, `Company` (relação), `Job Title`, `City`, `Linkedin`. Observação livre → `description` nativo ou Note.

**Padrão de import:** todo contato do Kaptar entra como **Desconhecido**. O sistema nunca assume "Responsável do Kaptar = decisor".

**✅ Confirmar:** campo criado + API name das opções.

---

## F. Bloco 4 — Opportunity: stages + campos

Menu: **Settings → Data Model → Opportunities**.

### Tela 4.1 — Campo `Stage` (editar o nativo)
1. Abrir o campo **`Stage`** (ele já existe e é um Select).
2. Ajustar as opções para **exatamente estas 7, nesta ordem** (renomear as que vierem, apagar as sobrando, adicionar as faltando com "+ Add option"):

| Ordem | Opção | Cor sugerida |
|---|---|---|
| 1 | Qualificado | cinza/azul |
| 2 | Reunião agendada | azul |
| 3 | Diagnóstico | roxo |
| 4 | Proposta enviada | amarelo |
| 5 | Negociação | laranja |
| 6 | Fechado | verde |
| 7 | Perdido | vermelho |

> **Não improvisar stages extras.** Estrutura confirmada como compatível: `Stage` é Select 100% editável em Data Model, e o Kanban da Opportunity usa esse campo automaticamente para as colunas.

### Tela 4.2 — Campo `Amount` (nativo)
- Confirmar que a moeda do `Amount` é **BRL (R$)**. Se houver default currency global, setar BRL.

### Tela 4.3 — Campo customizado `Oferta` (D6)
- **"+ New Field"** → tipo **Select** → Name `Oferta` → opções, nesta ordem:
  Landing Page · Site Institucional · Site Estruturado · Performance 1 Canal · Performance Multicanal · Presença Digital · Noryos Care · Combinação · A definir
- **Select único** (não Multi‑Select) — D6.

### Tela 4.4 — Campo customizado `Motivo da perda` (opcional recomendado)
- **"+ New Field"** → **Select** → Name `Motivo da perda` → opções:
  Preço · Timing · Sem budget · Sem fit · Concorrente · Sem resposta · Outro
- Barato e de alto valor de aprendizado. Se quiser mínimo absoluto, pode pular.

**NÃO criar:** `Probabilidade` (deprecated no Twenty; o Stage já implica), `Próxima ação` (é **Task**), `Origem` (herda da Company via relação), `Observações` (é `description`/Note), `Valor estimado`/`Data prevista` (são `Amount`/`Close date` nativos).

**✅ Confirmar:** `Stage` com as 7 opções na ordem certa; `Oferta` criada; `Motivo da perda` criada (ou decisão de pular) + API names.

---

## G. Bloco 5 — Views (as 8 aprovadas)

Para cada view: abrir o objeto no menu lateral → no seletor de view (topo) → **"+ Add view"** → nomear → escolher **Table** ou **Kanban** → aplicar **Filter** e **Sort** conforme a tabela.

### Companies

| # | Nome da view | Tipo | Filtro | Ordenação |
|---|---|---|---|---|
| 1 | **Novos leads** | Table | `Status de prospecção` = **Captado** | `Data de captura` ↓ (mais recente primeiro) |
| 2 | **Em análise** | Table | `Status de prospecção` = **Em análise** | `Prioridade` ↓ |
| 3 | **Leads prioritários** | Table | `Prioridade` = **Alta** **E** `Status de prospecção` = qualquer de {Captado, Em análise, Contato iniciado} | `Data de captura` ↓ |
| 4 | **Leads Kaptar** | Table | `Origem do lead` = **Kaptar** | `Data de captura` ↓ |
| 5 | **Clientes** | Table | `Status de prospecção` = **Cliente** | `Name` ↑ |

### Opportunities

| # | Nome da view | Tipo | Config |
|---|---|---|---|
| 6 | **Pipeline Comercial** | **Kanban** | Agrupar por `Stage` (o Twenty faz automático). Sem filtro. |
| 7 | **Propostas abertas** | Table | Filtro: `Stage` = qualquer de {Proposta enviada, Negociação}. Ordenar por `Close date` ↑ |

### Tasks

| # | Nome da view | Tipo | Config |
|---|---|---|---|
| 8 | **Follow-ups** | Table | Filtro: status **aberta** (To do / não concluída). Ordenar por **Due Date** ↑. (Calendar view é opcional.) |

**Evitar excesso de views.** Só essas 8. Uma view "Funil de prospecção" (Company em Kanban por `Status de prospecção`) é possível e limpa se você quiser um quadro visual do pré‑funil — mas **não é obrigatória** e não está na lista aprovada.

**✅ Confirmar:** 8 views criadas e cada filtro retornando o esperado (com a base ainda vazia, só confirmar que a view abre sem erro).

---

## H. Bloco 6 — Processo de follow-up (manual, Fase 1)

**Regra única:** *toda Company em `Contato iniciado` e toda Opportunity aberta tem exatamente UMA Task aberta — o próximo passo. Sem próxima Task = follow‑up perdido.*

Criar Task: abrir o registro (Company ou Opportunity) → aba/section **Tasks** → **"+ New task"** → título + **Due Date** + (opcional) assignee = você.

| Momento | Ação no CRM |
|---|---|
| Import do Kaptar | **Nenhuma Task em massa.** Trabalhar a view "Novos leads" de cima para baixo. |
| Início de contato | Company `Status → Contato iniciado` + Task **"1º follow‑up"** (+2 dias úteis) |
| Sem resposta | Concluir a Task + nova Task **"2º follow‑up"** (+3 dias) |
| Reunião marcada | Criar **Opportunity** (`Stage = Reunião agendada`) + Task **"Rodar diagnóstico"** na data |
| Pós‑reunião | **Note** com o diagnóstico + Task **"Preparar proposta"** (+2 dias) |
| Proposta enviada | Opportunity `Stage → Proposta enviada` + Task **"Follow‑up proposta"** (+3 dias) → depois (+7) |
| Negociação | **Sempre** uma Task datada antes de fechar a tela |
| Fechou | Opportunity `Stage → Fechado` + Company `Status → Cliente` + concluir Tasks abertas |
| Perdeu | Opportunity `Stage → Perdido` + `Motivo da perda` |

**Checagem diária:** abrir a view **"Follow‑ups"**. Abrir a view **"Pipeline Comercial"** e varrer se alguma Opportunity está sem Task aberta.

Sem automação nesta fase (workflows = Fase 2).

---

## I. Bloco 7 — Preparação do CSV piloto

> **Não alterar o CSV original do Kaptar.** Trabalhar numa **cópia**. Arquivo de saída: `kaptar-piloto-<AAAAMMDD>-twenty-companies.csv` (+ um `-people.csv` se houver contatos reais).

### 7.1 — Piloto = 5 leads enriquecidos
Usar os **5 leads já enriquecidos** que temos. **Me envie esse export do Kaptar** (arquivo ou colado) + **1 exemplo da URL da coluna "Google Maps"** — eu devolvo os CSVs normalizados prontos para o wizard.

### 7.2 — Normalização (o que eu aplico)

| Item | Regra |
|---|---|
| Encoding | UTF‑8 |
| Arquivo | 1 objeto por arquivo: **Companies primeiro**, People depois |
| Telefone / WhatsApp | Só dígitos; formato **E.164** `+55DDDNNNNNNNN`. Se o wizard pedir colunas separadas (tela 3 do import): número / country `BR` / calling `+55` |
| `Avaliação Google` | Vírgula → ponto (`4,7` → `4.7`) |
| `Kaptar Score`, `Nº de avaliações` | Inteiro, sem texto |
| `Data de captura` | `AAAA‑MM‑DD` (de "Encontrado em") |
| Domínio (`Domain Name`) | minúsculo, sem `http(s)://`, sem `www.`, sem path. **Se for instagram.com / facebook.com / linktr.ee → domínio fica VAZIO** (não é site próprio) |
| `Instagram` | URL completa `https://instagram.com/<handle>` |
| `Google Maps` | URL crua, como veio |
| `Google Place ID` | **Só** se houver `ChIJ…` real ou parâmetro `place_id:` na URL. Senão **vazio**. Nunca inventar. |
| `Google CID` *(se o campo existir)* | Extrair de `?cid=<número>` ou do trecho `!1s0x…:0x<hex>` (hex → decimal) da URL do Maps. Senão vazio. |
| `Segmento` | Mapear "Nicho" do Kaptar → 1 dos 7 buckets (você me dá o de‑para dos nichos que aparecerem; sem match → **Outro**) |
| `Origem do lead` | Constante **Kaptar** |
| `Status de prospecção` | Constante **Captado** |
| `Prioridade` | Constante **Não avaliado** |
| `Tipo de presença web` | Constante **Não analisado** (o "Tem site" do Kaptar não é confiável) |
| `Chave de dedup` (`dedupeKey`) | Precedência: `gplace:<placeid>` → senão `gcid:<cid>` → senão `domain:<domínio>` → senão `phone:<dígitos>` → senão `namecity:<slug(nome)>|<slug(cidade)>|<UF>` |
| Células vazias | Deixar **vazias** (nada de "N/A", "-", "null") |
| Resumo IA do Kaptar | **Não** vai como campo. Se útil, vira Note manual depois. |

### 7.3 — Sobre extrair Place ID da URL do Google Maps (D7)

Realidade técnica, para não criar expectativa errada:
- **Place ID canônico** = `ChIJ…` (~27 caracteres). Só aparece na URL se o Kaptar tiver usado a Places API (`…/place/?q=place_id:ChIJ…`).
- URL comum do Maps (`…/place/<nome>/@lat,lng,17z/data=…!1s0x…:0x<hex>…` ou `maps.google.com/?cid=<número>`) **não** carrega o `ChIJ…` — carrega o **CID** (número) ou o **FID** hexadecimal.
- **CID e Place ID são identificadores diferentes.** Dá para extrair o CID de forma determinística; converter CID → Place ID exige chamada à Google Places API (fora de escopo da Fase 1).

**Conclusão:** `Google Place ID` só é preenchido com valor real. O que conseguimos capturar agora do Kaptar é o **CID** (campo opcional `Google CID`). A dedup na Fase 1 se apoia em `dedupeKey` (que já usa CID quando existe) + domínio + telefone. Place ID "de verdade" para todos os registros fica para a **Fase 3**, com a API do Google.

### 7.4 — Template de colunas (arquivo Companies)

`Name, Domain Name, Segmento, Telefone principal, WhatsApp provável (Kaptar), Address (city), Address (state), Instagram, Google Maps, Google CID, Google Place ID, Kaptar Score, Avaliação Google, Nº de avaliações Google, Origem do lead, Data de captura, Status de prospecção, Prioridade, Tipo de presença web, Chave de dedup`

(Um `.csv` só com essa linha de cabeçalho está em `crm/templates/kaptar-companies-template.csv`.)

### 7.5 — Template de colunas (arquivo People — só contatos reais)

`First name, Last name, Company (Domain Name), Emails, Phones, Tipo de contato`
- Só linhas onde "Responsável" do Kaptar é **nome de pessoa real** (não nome de empresa, não vazio).
- `Tipo de contato` = constante **Desconhecido**.
- Se o wizard não linkar a Company automaticamente pelo domínio, você abre cada Person e seta `Company` na mão (com 5 registros é trivial) — e a gente anota isso como limitação observada.

**✅ Confirmar:** você me enviou o export dos 5 leads + 1 exemplo de URL do Maps; eu te devolvo `…-companies.csv` (e `…-people.csv` se aplicável).

---

## J. Bloco 8 — Import piloto (5 telas do wizard)

Menu: **Companies** (menu lateral) → ícone **"⋮"** (canto superior direito) → **"Import records"**. (Ou `Ctrl/Cmd + K` → "Import records" → "Companies".)

| Tela | O que fazer |
|---|---|
| **1 — Upload** | Botão **"Select file"** → escolher `kaptar-piloto-…-companies.csv` |
| **2 — Column mapping** | Conferir o auto‑match. Ajustar nos dropdowns. Colunas que não forem usar → **"Do not map"**. Garantir que `Chave de dedup` → campo `Chave de dedup`, e `Name` → `Name`. |
| **3 — Select value mapping** | Para `Segmento`, `Origem do lead`, `Status de prospecção`, `Prioridade`, `Tipo de presença web`: casar cada valor do arquivo com a opção existente (não "criar nova opção" — as opções certas já existem do Bloco 2). |
| **4 — Validation / Next Steps** | Linhas com problema ficam **amarelas**. Editar célula direto ou **"X"** para pular a linha. Conferir o resumo. |
| **5 — Confirm** | **"Confirm"** para processar. |

Depois: abrir **Companies → view "Novos leads"** e conferir os 5 registros.

**✅ Confirmar (checklist do teste de importação — reportar cada item):**

- [ ] 5 Companies criadas
- [ ] `Name` correto
- [ ] `Telefone principal` no formato certo e discável
- [ ] `Domain Name` só onde há site próprio real (Instagram → vazio)
- [ ] `Instagram` preenchido e clicável
- [ ] `Address` cidade/estado corretos
- [ ] `Segmento` mapeado no bucket certo
- [ ] `Kaptar Score` numérico
- [ ] `Avaliação Google` com ponto decimal (ex: 4.7)
- [ ] `Nº de avaliações Google` inteiro
- [ ] `Google Maps` abre o local certo
- [ ] `Google Place ID` — preenchido só se real / vazio caso contrário
- [ ] `Google CID` — preenchido quando extraível (se o campo existir)
- [ ] `Origem do lead` = Kaptar
- [ ] `Data de captura` correta
- [ ] `Status de prospecção` = Captado
- [ ] `Chave de dedup` preenchida em todos
- [ ] acentuação correta (sem `Ã§`, `Ã©` etc.)

---

## K. Bloco 9 — Teste de duplicação (proposital)

1. Pegar **1** dos 5 registros. Anotar a contagem atual de Companies (deve ser 5).
2. Criar um CSV com **essa 1 linha só**, mantendo a **mesma `Chave de dedup`**. Mudar de propósito **1 campo não‑chave** (ex: `Prioridade` = Alta, ou `Avaliação Google` diferente).
3. Rodar o import de novo com esse arquivo de 1 linha.
4. **Resultado esperado:** contagem de Companies **continua 5** (não vira 6) e o campo que você mudou aparece **atualizado** no registro existente.
5. Fazer um 2º teste: mudar a `Chave de dedup` dessa linha para um valor novo e reimportar → agora **deve** criar a 6ª Company. Depois apagar essa 6ª de teste (Destroy).

**✅ Reportar:** comportamento exato observado nos dois casos (atualizou? duplicou? deu erro de "unique"? qual a mensagem?). Isso valida a estratégia de dedup inteira.

---

## L. Bloco 10 — Teste de qualificação e relacionamento

Com **1** lead piloto, percorrer o fluxo inteiro:

1. Company → `Status de prospecção`: **Captado → Em análise → Contato iniciado → Qualificado** (mudar o campo em cada passo).
2. No passo "Contato iniciado": criar **Task** "1º follow‑up" (+2 dias) no registro da Company.
3. Criar uma **Person** real (pode ser fictícia marcada como teste) e ligar à Company (campo `Company`). Setar `Tipo de contato`.
4. Com a Company em **Qualificado**: criar uma **Opportunity**:
   - `Name`: "Site — <nome da empresa>"
   - `Company`: a Company do piloto
   - `Point of Contact`: a Person criada
   - `Stage`: **Reunião agendada**
   - `Amount`: um valor em R$
   - `Oferta`: ex. **Site Institucional**
5. Na Opportunity: criar **Task** "Rodar diagnóstico".
6. Na Opportunity: criar **Note** "Diagnóstico — <empresa>" com 3 linhas de texto.
7. Avançar `Stage`: Reunião agendada → Diagnóstico → Proposta enviada → Negociação → **Fechado**.
8. Ao marcar **Fechado**: mudar a Company `Status de prospecção` → **Cliente** (manual nesta fase).
9. Abrir a view **"Clientes"** e conferir que a Company aparece. Abrir **"Pipeline Comercial"** (Kanban) e ver a Opportunity na coluna Fechado.
10. Repetir rápido um caso **Perdido**: outra Opportunity de teste → `Stage` = **Perdido** + `Motivo da perda` = ex. "Sem resposta".

**✅ Reportar (checklist do teste de pipeline / relacionamento):**

- [ ] `Status de prospecção` percorreu os 6 valores sem travar
- [ ] Company ↔ Person ligadas (aparece nos dois lados)
- [ ] Opportunity ligada à Company e à Person
- [ ] Task aparece dentro da Company e dentro da Opportunity
- [ ] Note aparece na Opportunity
- [ ] Kanban "Pipeline Comercial" move a Opportunity entre as 7 colunas
- [ ] view "Propostas abertas" mostra a Opportunity quando em Proposta enviada/Negociação
- [ ] view "Clientes" mostra a Company quando Cliente
- [ ] view "Follow-ups" lista as Tasks abertas por vencimento
- [ ] caso "Perdido" com `Motivo da perda` registrado

---

## M. Bloco 11 — Relatório final de validação (eu compilo, com seus dados)

Estrutura acordada (você me passa as observações dos Blocos 8–10, eu monto):

1. **IMPLEMENTADO** — workspace, locale, objetos, campos, Selects, pipeline, views, processo
2. **TESTADO** — o que foi exercitado hands‑on
3. **RESULTADO DO TESTE DE IMPORTAÇÃO** — checklist do Bloco 8
4. **RESULTADO DO TESTE DE DUPLICAÇÃO** — Bloco 9, comportamento exato
5. **RESULTADO DO PIPELINE** — Bloco 10
6. **RESULTADO COMPANY / PERSON / OPPORTUNITY / TASK / NOTE** — relacionamento
7. **CAMPOS CRIADOS** — lista final com API names
8. **VIEWS CRIADAS** — 8, com filtros
9. **LIMITAÇÕES ENCONTRADAS**
10. **DIFERENÇAS ENTRE DOCUMENTAÇÃO E WORKSPACE REAL**
11. **PENDÊNCIAS**
12. **PRÓXIMA FASE RECOMENDADA**
13. **QUALITY GATE: APROVADO / REPROVADO** — só APROVADO se `Kaptar CSV → Company → qualificação → Opportunity → Task → pipeline → fechamento` foi demonstrado na prática, sem desenvolvimento customizado.

---

## N. Pontos que dependem de observação no workspace real

Anotar durante a execução (vão para o item 10 do relatório):

1. Região(ões) de dados oferecidas pelo Twenty (D10).
2. Nome/rótulo exato dos campos nativos que aparecem em Company/Person/Opportunity (podem variar da doc por versão).
3. Se o `Stage` da Opportunity vem com opções default e quais eram antes de editar.
4. Se o import wizard consegue **atualizar** casando por um campo **customizado** único (`Chave de dedup`) ou só pelos nativos (`domain`, `id`).
5. Se o wizard linka Person → Company pelo domínio automaticamente.
6. Comportamento com telefone: aceita coluna única E.164 ou exige as 3 colunas separadas.
7. Se "Advanced mode" mostra o API name de cada **opção** de Select (não só do campo).
8. Qualquer tela que peça cartão / pagamento / conexão externa → **parar e avisar**.

---

## O. Ordem de execução (resumo)

```
Bloco 0  criar conta + workspace           (você) ⛔ ponto de parada: cadastro
Bloco 1  configs gerais + Advanced mode     (você)
Bloco 2  Company: 15–16 campos              (você) → me manda API names
Bloco 3  Person: 1 campo                    (você)
Bloco 4  Opportunity: 7 stages + 2 campos   (você) → me manda API names
Bloco 5  8 views                            (você)
Bloco 6  ler o SOP de follow-up             (você)
Bloco 7  preparar CSV piloto                (eu, com seu export do Kaptar)
Bloco 8  import piloto (5 telas)            (você) → reporta checklist
Bloco 9  teste de duplicação               (você) → reporta comportamento
Bloco 10 teste qualificação + relações     (você) → reporta checklist
Bloco 11 relatório final + Quality Gate    (eu, com seus dados)
```

**Nada de pagamento antes do Bloco 11.** A contratação do Pro anual só é recomendada depois de `QUALITY GATE: APROVADO`.
