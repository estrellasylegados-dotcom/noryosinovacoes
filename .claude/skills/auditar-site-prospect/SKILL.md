---
name: auditar-site-prospect
description: >
  Recebe a URL do site de uma empresa prospectada (ex: encontrada sem site,
  com site antigo ou com presença digital fraca no Google Meu Negócio) e
  gera um diagnóstico comercial inicial pra abordagem da Noryos — sem
  inventar métrica. Use quando o usuário disser "audita esse site",
  "analisa esse concorrente/prospect", "/auditar-site-prospect [URL]", ou
  colar uma URL pedindo avaliação pra prospecção.
---

# /auditar-site-prospect — Diagnóstico comercial de prospecção

## Dependências

- Posicionamento e tom da Noryos: `projetos/Noryos-Inovacoes/decisoes-site.md`
- Serviços priorizados: `projetos/Noryos-Inovacoes/site/src/content/servicos.ts`

---

## Workflow

### Passo 1 — Coletar a URL

Se o usuário não informou, perguntar: "Qual o site (ou perfil do Google
Meu Negócio) da empresa que você quer avaliar?"

### Passo 2 — Analisar o que dá pra observar de fato

Usar `WebFetch` pra carregar a página e observar:

- **Mobile:** o layout quebra, tem texto cortado, botão pequeno demais?
- **Clareza da oferta:** dá pra entender o que a empresa faz e pra quem em poucos segundos?
- **Canal de contato:** existe WhatsApp, telefone ou formulário visível? Funciona?
- **CTA:** existe uma ação clara, ou o visitante chega e não sabe o que fazer?
- **Performance percebida:** a página parece pesada, com imagem gigante não otimizada?
- **SEO básico:** tem `title`/`description` que fazem sentido? Headings organizados?
- **Idade/manutenção aparente:** copyright desatualizado, design datado, links quebrados

### Passo 3 — Gerar a saída

Estruturar como:

```
## Diagnóstico rápido — [nome da empresa / URL]

**Observado (fato, não opinião):**
- [lista do que foi realmente visto na página]

**Problemas identificados:**
- [cada problema, ligado à observação — nunca "provavelmente" apresentado como certeza]

**Oportunidades (o que a Noryos resolveria):**
- [ligar cada oportunidade a um serviço real: Presença Digital / Automação / Aquisição e Performance / Conteúdo]

**Mensagem inicial de prospecção (rascunho):**
[2-3 frases, tom direto e não genérico, citando algo específico e verdadeiro sobre o site deles — nunca elogio vazio nem crítica agressiva]

**Pontos para reunião, se houver retorno:**
- [2-3 perguntas que abririam a conversa]
```

### Passo 4 — Nota/score (opcional)

Só incluir nota se houver critério documentado e aplicado de forma
consistente (ex: 1 ponto por item da checklist do Passo 2 que falhou).
Nunca apresentar um número "no chute". Se não houver critério consistente
aplicado, omitir a nota e manter só a lista de problemas/oportunidades.

---

## Regras

- **Nunca inventar métrica** (tráfego, conversão, posição no Google) que não foi de fato medida
- Diferenciar sempre fato observado ("a página demorou pra carregar no teste") de recomendação ("recomendamos otimizar imagens")
- Mensagem de prospecção nunca usa os buzzwords proibidos da Noryos (ver `decisoes-site.md`)
- Se o site não carregar ou o `WebFetch` falhar, reportar isso — não simular uma análise
