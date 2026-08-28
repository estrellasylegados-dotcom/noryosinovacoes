# Noryos Inovações — Análise de mercado e direção de design

**Data:** 27/08/2026
**Objetivo:** definir cores, tipografia e princípios de estilo pro site institucional, antes de desenhar qualquer tela.

---

## 1. Posicionamento

Noryos Inovações vai competir num mercado brasileiro de agências de marketing
digital + automação pra PMEs que está saturado de players genéricos (SEO +
tráfego pago + "presença digital" com discurso intercambiável). Os líderes
do setor (DTi Digital, Rock Content, agências regionais tipo Websmarketing,
Spin) se diferenciam por nicho, prova de resultado ou verticalização —
não por promessa genérica de "marketing digital completo".

Como a Noryos pode nichar futuramente em odontologia, o site precisa:
- Passar credibilidade de consultoria estratégica, não de "freelancer com Canva"
- Não fechar a porta pra outros nichos de PME enquanto o foco em odonto não é decidido
- Ter uma base visual sólida o suficiente pra, no futuro, ganhar uma variação
  de mensagem pro nicho odonto sem precisar redesenhar tudo

## 2. O problema a evitar: "cara de site feito por IA"

Pesquisei o que hoje é considerado o padrão reconhecível de site gerado por
IA sem direção humana — exatamente o que você pediu pra evitar:

- **Gradiente indigo→roxo** atrás do hero — é hoje o "tell" mais óbvio de site feito por IA ([925studios](https://www.925studios.co/blog/ai-slop-design-tells), [prg.sh](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website))
- **Inter em todos os pesos**, pra título, corpo e botão — sinaliza que ninguém tomou uma decisão tipográfica
- **Glassmorphism genérico** (cards translúcidos com glow neon fraco) usado sem motivo
- **Três cards redondos em fileira**, ícone de linha fina + título + duas linhas de texto — o "template" mais repetido
- Copy vazia tipo "Construa mais rápido. Entregue melhor." + ícones intercambiáveis
- Excesso de microanimação (bounce em hover, tudo animando ao mesmo tempo)

A saída, segundo quem estuda isso, não é "menos moderno" — é **decisão
específica**: paleta própria com significado, par tipográfico deliberado,
layout que quebra a grade previsível, copy que só a Noryos poderia assinar.
Fontes: [925studios](https://www.925studios.co/blog/ai-slop-design-tells), [Wandr Studio](https://wandr.studio/blog/b2b-web-design-trends-2026), [Medium — AI Design Slop](https://mohitphogat.medium.com/ai-design-slop-why-every-ai-built-interface-looks-the-same-and-how-to-fix-it-bf874e0b470c)

## 3. O que está funcionando em B2B premium em 2025/26

- **Hierarquia tipográfica real**, não divs estilizadas — títulos que resolvem
  a pergunta "o que essa empresa faz" na primeira dobra, em português direto
- **Restrição no movimento**: transição que confirma uma ação, gráfico que
  anima ao entrar na tela — nunca scroll-jacking ou sequência pesada
- **Performance como sinal de competência**: site rápido = agência que entende
  o que vende (especialmente relevante vendendo justamente performance digital)
- **Dark mode como opção elegante, não decreto**: público B2B lê em monitor
  de escritório iluminado — dark mode inteiro pode prejudicar legibilidade;
  melhor usar tom escuro em seções estratégicas (hero, prova social) e claro
  no restante ([Wandr Studio](https://wandr.studio/blog/b2b-web-design-trends-2026))
- Paletas 2026 em marcas de tecnologia estão migrando de "azul SaaS
  genérico" pra combinações com verde, terracota ou neutros quentes de alto
  contraste — justamente pra fugir do clichê ([Inkbot Design](https://inkbotdesign.com/stunning-colour-palettes/), [Rishfeld Designs](https://www.rishfelddesigns.com/color-palette-inspiration-for-tech-startups-10-schemes-that-build-trust/))

## 4. Recomendação de direção visual

Objetivo: elegante, atual, com sensação de "estúdio" — não de SaaS
americano nem de agência de Canva. Uma paleta com significado, não a
paleta default do Tailwind.

Preparei 3 direções (ver mensagem principal com as opções pra você escolher).
Depois de decidida, viro isso em `identidade/design-guide.md` desse projeto
e começo o site.

## 5. Tipografia (recomendação, qualquer que seja a paleta)

- **Títulos:** uma fonte com caráter — serifada editorial (ex: Fraunces,
  Newsreader) ou grotesca geométrica confiante (ex: General Sans, Neue
  Montreal) — nunca Inter no título
- **Corpo e UI:** um sans humanista neutro (Inter ou Public Sans servem aqui
  — o problema não é a fonte, é usar a mesma fonte pra tudo)
- Par: título com personalidade + corpo neutro = hierarquia real, sem
  gritar "gerado por IA"

## 6. Princípios de layout

- Quebrar a grade de "3 cards iguais" — usar assimetria, tamanhos variados,
  uma seção editorial de texto corrido
- Nada de glow neon, nada de blob de gradiente atrás do hero
- Fotografia real ou ilustração própria — não imagem de robô genérico
- Motion contido: micro-transições que confirmam ação, não decoram
- Acessibilidade e contraste como padrão, não retrofit
