# Definition of Done — checklist por tipo de entrega

Marcar só o que for pertinente ao que mudou. Item pertinente sem
evidência = **REPROVADO**.

---

## Transversal (toda tarefa relevante)

- [ ] Requisito compreendido corretamente (comparar resultado com o pedido original)
- [ ] Implementação concluída
- [ ] Erros tratados (sem caminho que quebra silenciosamente)
- [ ] Nenhum secret/token/`.env` versionado
- [ ] Regressões relevantes verificadas (ver "Regressão" no fim)
- [ ] Resultado comparado criticamente com o pedido — melhorias necessárias aplicadas e retestadas
- [ ] Nível de validação declarado (IMPLEMENTADO / TESTADO / VALIDADO LOCALMENTE / VALIDADO EM PRODUÇÃO)

---

## WEB/UI

### Automatizado (em `projetos/Noryos-Inovacoes/site/`)
- [ ] `npm run quality` verde de ponta a ponta — **lint + build + E2E**
      (Playwright contra o build de produção; ver `suite-e2e.md`)
- [ ] `npm run build`: todas as rotas esperadas geradas
      (`/`, `/solucoes`, `/solucoes/sites`, `/solucoes/automacoes`,
      `/solucoes/performance`, `/sobre`, `/diagnostico`, `/contato`,
      `/politica-de-privacidade`)
- [ ] `/revisar-site-noryos` rodado e reportado (copy/LGPD/posicionamento)
- [ ] Teste E2E novo criado/ajustado se a mudança introduziu fluxo ou
      elemento crítico não coberto

### Navegador real — inspeção visual humana (Playwright NÃO substitui; ou marcar NÃO VALIDADO)
- [ ] Abri a área alterada em navegador (real ou `/webapp-testing`) e executei o fluxo do usuário
- [ ] Olhei os screenshots de evidência (`site/e2e/__evidence__/`)
- [ ] Renderização: sem clipping, sobreposição, elemento oculto indevido
- [ ] Espaçamento, fontes, contraste, hierarquia, alinhamento OK
- [ ] Estados: hover, focus, scroll, disabled, loading
- [ ] Console limpo e Network sem 404/500 (a suíte já cobre `/` e rotas
      principais; conferir manualmente telas fora da cobertura)

### Responsividade
- [ ] 360px, 390px, tablet, desktop, desktop largo (quando fizer sentido)
- [ ] Sem scroll horizontal; textos, cards, menu, CTA, logo, imagens, modais OK
- [ ] Touch targets adequados no mobile

### Animações / motion
- [ ] Animação realmente acontece e é perceptível
- [ ] Dispara na hora certa (não fora da viewport, não reinicia sem motivo)
- [ ] Não trava, não está rápida/lenta/sutil/exagerada demais
- [ ] Funciona após build de produção
- [ ] `prefers-reduced-motion` reduz/desliga (testar no DevTools)
- [ ] Mobile recebe versão adequada

### Acessibilidade básica
- [ ] Contraste adequado sobre o fundo escuro
- [ ] Navegação por teclado no menu e no formulário
- [ ] Labels/aria em campos e controles; foco visível

### Links e CTAs alterados
- [ ] Clique → destino/rota/âncora/parâmetros corretos
- [ ] Links de WhatsApp e externos abrem certo; sem 404
- [ ] Comportamento mobile

### SEO / metadata / Open Graph / favicon
- [ ] HTML final tem a tag no `<head>` (não só o arquivo fonte)
- [ ] `title`/`description` únicos por página; canonical correto
- [ ] Open Graph e Twitter/X com URL absoluta; imagem responde 200 e MIME certo
- [ ] favicon e apple-icon aparecem (abrir aba no navegador; testar cache)
- [ ] `sitemap.ts` inclui todas as rotas publicadas; JSON-LD presente

---

## BACKEND

- [ ] Fluxo real executado (não só compila)
- [ ] Entrada válida → saída correta; entrada inválida → erro tratado
- [ ] Persistência confirmada quando aplicável (ver BANCO DE DADOS)
- [ ] Comportamento em falha (dependência fora, timeout) previsível
- [ ] Exceções tratadas; logs úteis, sem vazar dado sensível
- [ ] Idempotência quando aplicável

---

## API

- [ ] Status codes corretos (2xx/4xx/5xx conforme o caso)
- [ ] Payload conforme o contrato; validação de input
- [ ] Autenticação e autorização checadas
- [ ] Erro de input retorna mensagem/estrutura previsível
- [ ] Persistência e efeitos colaterais confirmados
- [ ] Timeout e falha de dependência tratados
- [ ] Testado com chamada real (curl/cliente), não só leitura de código

---

## AUTOMAÇÃO

- [ ] Script rodado ponta a ponta com dados reais/representativos
- [ ] Saída conferida (arquivo gerado, registro criado, mensagem enviada)
- [ ] Caso de erro: entrada faltando, credencial ausente, serviço fora
- [ ] Reexecução não duplica nem corrompe (idempotência)
- [ ] Logs mostram o que aconteceu
- [ ] Não roda destrutivo em produção sem necessidade e sem confirmação

---

## CONTEÚDO

- [ ] Tom de voz e regras de `_memoria/preferencias.md` respeitados
- [ ] Posicionamento Noryos: nada soando "agência de marketing"; sem buzzword proibido
- [ ] Nenhum cliente, número, depoimento, logo ou selo fictício como real
- [ ] Fatos conferidos; links do texto abrem e apontam pro destino certo
- [ ] Formatação final revisada no meio onde vai ser publicado
- [ ] CTA correto e coerente

---

## DOCUMENTO

- [ ] Responde ao objetivo declarado; estrutura navegável
- [ ] Números e afirmações verificáveis; nada inventado
- [ ] Datas relativas convertidas para absolutas
- [ ] Links internos/externos resolvem
- [ ] Sem informação sensível exposta indevidamente

---

## INFRA

- [ ] Mudança testada em build de produção (`npm run build` + `npm start`)
- [ ] Efeito no deploy verificado (ou passos manuais necessários documentados — ex.: purge de CDN na Hostinger)
- [ ] `.env`/segredos não versionados; `.env.example` atualizado se mudou contrato
- [ ] Rollback conhecido
- [ ] Após deploy: abrir produção, conferir funcionalidade, Console, asset e conteúdo servido (não assumir "push = produção OK")
- [ ] Restrições do ambiente respeitadas (ex.: Next 15.x por glibc da Hostinger — ver `site/AGENTS.md`)

---

## INTEGRAÇÃO

- [ ] Fluxo real disparado ponta a ponta quando as credenciais existem
- [ ] Resposta do serviço externo conferida (sucesso e erro)
- [ ] Timeout e indisponibilidade do parceiro tratados
- [ ] Sem chave service role / secret no client
- [ ] **Se depende de credencial ausente → marcar NÃO VALIDADA** e listar o que falta

---

## BANCO DE DADOS (quando houver persistência)

- [ ] Registro criado com dados e tipos corretos; nulls esperados; constraints
- [ ] Update e leitura conferidos; deleção quando aplicável
- [ ] Erro de conexão / credencial ausente tratado
- [ ] Nunca usar produção destrutivamente sem necessidade

---

## FORMULÁRIOS (quando houver)

- [ ] Vazio; campos obrigatórios; validação incorreta; dados válidos
- [ ] Envio → loading → sucesso / erro / timeout / backend fora
- [ ] Mensagem exibida ao usuário; persistência confirmada
- [ ] Duplo clique no botão não duplica envio
- [ ] Mobile
- [ ] Site da Noryos: consentimento LGPD obrigatório, honeypot e tempo mínimo ativos (`src/app/diagnostico/actions.ts`)

---

## PERFORMANCE (se a mudança puder impactar)

- [ ] Carregamento, bundle, imagens, re-renders, network
- [ ] CLS / LCP não pioraram de forma perceptível
- [ ] Melhoria visual não deixou a experiência lenta

---

## Regressão (sempre, após a mudança)

- Alterou **Header** → menu, CTA, mobile, logo, sticky, scroll
- Alterou **metadata** → OG, favicon, canonical, sitemap
- Alterou **componente compartilhado** → outras páginas que o usam
- Alterou **motion/CSS global** → demais seções e páginas
