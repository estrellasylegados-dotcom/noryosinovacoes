# /deploy-captouleads — Deploy CaptouLeads na Vercel

Automatiza o deploy de produção do CaptouLeads na Vercel.

## Workflow

### Pré-requisitos
- Token Vercel válido (`vcp_...`)
- Estar em `projetos/CaptouLeads/app`
- Sem mudanças não commitadas (aviso se houver)

### Passos

1. **Verificar status**
   - `git status` em CaptouLeads — se houver mudanças, avisar e oferecer salvar (`git add . && git commit`)
   - Confirmar que quer fazer deploy

2. **Build local** (validação antes de subir)
   - `npm run build` — se falhar, parar com erro
   - `npm run typecheck` — se falhar, parar com erro

3. **Deploy na Vercel**
   - Caminho principal (validado em 26/09/2026): `git push origin main` no repo `captouleads` → a Vercel builda sozinha (Root Directory do projeto = `app`)
   - Alternativa pela CLI: rodar `vercel deploy --prod` a partir de `projetos/CaptouLeads/` (raiz do repo, por causa do Root Directory `app`) — **não testado** nessa configuração
   - Acompanhar o deploy até `READY` ou `ERROR` (~1-3 min); se `ERROR`, ler os Build Logs antes de mudar qualquer coisa

4. **Validar em produção**
   - `curl https://captouleads.vercel.app/api/health` → deve responder `{"ok":true,"db":true,...}`
   - `curl -X POST https://captouleads.vercel.app/api/jobs/tick` sem auth → deve responder 401
   - Se falhar, avisar e linkar pro painel Vercel pra debugar

5. **Confirmar**
   - Mostrar URL final
   - Commit message: "Deploy CaptouLeads na Vercel (commit XYZ)"

## Regras

- **Nunca** fazer deploy com mudanças não commitadas
- **Nunca** usar `--force` sem o usuário pedir
- Se o health check falhar, não afirmar "pronto" — oferecer opções:
  - Verificar variáveis de ambiente no painel Vercel
  - Rodar logs em produção
  - Fazer rollback (voltar deploy anterior)
- Token guardado em memória da skill, não em arquivo (segurança)
- Sempre terminar com `QUALITY GATE: APROVADO` ou `REPROVADO`

## Status obrigatório

Encerrar com:
```
QUALITY GATE: APROVADO — Deployado em https://...
ou
QUALITY GATE: REPROVADO — Motivo: [build falhou | health check falhou | etc]
```
