# Identidade visual — Noryos Inovações

> **Revisado em 28/08/2026 — redesign "Digital Operating System".**
> Mantém a estratégia e a paleta-base da revisão de 27/08/2026 (empresa de
> tecnologia, não agência — ver `../decisoes-site.md`), mas aprofunda o uso
> da paleta, troca o par tipográfico e formaliza um motion system. A direção
> anterior ("Grafite + Esmeralda", editorial) e a intermediária (Space
> Grotesk + cards planos) ficam no histórico do git, não duplicadas aqui.
>
> Fonte de verdade técnica: `site/src/app/globals.css` (`@theme`) — nenhum
> hex/valor solto nos componentes, tudo referencia token. Este documento
> descreve a intenção; o CSS descreve os números.
>
> **29/08/2026:** logo e ícone oficiais recebidos e plugados no site — ver
> a seção "Logo".

---

## Sensação-alvo

"Existe um sistema inteligente funcionando por trás dessa empresa."
Tecnológica, organizada, estratégica, sofisticada, confiável. A tecnologia
é percebida por **organização, interfaces, movimento com propósito, dados e
fluxos** — nunca por futurismo decorativo, neon ou partícula. O próprio
site é a primeira demonstração de competência da Noryos.

---

## Cores

Dark-first. A profundidade vem de **planos de superfície + luz localizada +
hairlines**, não de trocar preto por azul-escuro.

### Superfícies (planos de profundidade)

| Token | Hex | Uso |
|---|---|---|
| `--color-ink` | `#0B0D10` | fundo base da página |
| `--color-ink-secondary` / `--color-surface-1` | `#0E141B` | seções alternadas, footer, chrome de janelas |
| `--color-card` / `--color-surface-2` | `#12171D` | superfície de card padrão |
| `--color-surface-3` | `#161E27` | camada interna (trilhos, blocos dentro de card) |
| `--color-surface-raised` | `#1A232D` | chips, nós ativos, elementos elevados |

### Texto

| Token | Hex | Uso |
|---|---|---|
| `--color-text` | `#F5F7FA` | texto principal |
| `--color-text-muted` | `#A7B0BA` | subtítulos, corpo secundário |
| `--color-text-dim` | `#717C88` | rótulos mono, metadados, numeração |

### Acentos

| Token | Hex | Uso |
|---|---|---|
| `--color-cyan` | `#2DD4FF` | cor tecnológica principal, CTA primário, links de estado |
| `--color-cyan-soft` | `#7CE4FF` | hover de superfície ciano |
| `--color-green` | `#43E6A6` | status / automação / "concluído" — uso moderado |
| `--color-green-soft` | `#86F0C8` | idem, variação clara |
| `--color-whatsapp` | `#25D366` | **só** no badge do botão flutuante do WhatsApp |

### Linhas

- `--hairline` = `rgba(167,176,186,0.12)` — borda padrão
- `--hairline-strong` = `rgba(167,176,186,0.22–0.24)` — hover, foco, divisórias

### Luz e textura (baixa opacidade, decorativas, `aria-hidden`)

- `.glow-cyan` — luz ciano radial localizada (~12% no pico), posicionável via `--glow-x/--glow-y`
- `.tech-grid` — grid técnico 56px com máscara radial; nunca compete com o texto
- `.noise` — ruído fractal ~4,5% via data-URI SVG
- Gradiente de topo do `body`: radiais ciano (6%) + verde (3,5%) que somem — só "iluminam" o hero

### Cor proibida

Gradiente indigo→roxo, blob de gradiente atrás do hero, azul-SaaS genérico,
glassmorphism com glow neon, neon em excesso, efeito arco-íris no texto.

---

## Tipografia

Par deliberado 2 + 1 — nunca a mesma fonte pra tudo. Todas via `next/font/google`.

| Papel | Fonte | Observação |
|---|---|---|
| Display / títulos | **Manrope** (600–800) | geométrica-humanista, tracking fechado, presença premium |
| Corpo, UI, botões | **Inter** | leitura neutra; base 1,0625rem / line-height 1,6 |
| Rótulos, números de interface, chrome | **Geist Mono** (400–500) | seletor do Noryos OS, scores do diagnóstico, numeração de etapas, `SectionLabel` |

### Escala (classes utilitárias em `globals.css`)

| Classe | Tamanho | Uso |
|---|---|---|
| `.t-display` | `clamp(2.75rem → 4.75rem)`, LH 1.04, tracking −0.03em | H1 do hero e heros de página |
| `.t-h2` | `clamp(1.9rem → 2.9rem)`, LH 1.08 | títulos de seção |
| `.t-h3` | `clamp(1.2rem → 1.5rem)` | títulos de card / subseção |
| `.t-lead` | `clamp(1.05rem → 1.25rem)`, cor muted | subheadline, parágrafo de abertura |
| `.t-label` | Geist Mono, 0.72rem, tracking 0.16em, uppercase | eyebrow / rótulo de seção |
| `.t-mono` | Geist Mono, tabular-nums | números em interface |

- Headlines com **quebras de linha intencionais** (passadas como array pro `AnimatedHeading`), não quebra automática.
- `.accent-gradient` (ciano→verde no texto) — no máximo **uma palavra** do hero ("crescimento"). Nunca mais que isso, nunca arco-íris.
- Peso de título: 600. Reservar 700–800 pra display muito grande.

---

## Espaçamento e ritmo

- Container padrão `--container-max` 1200px; `.container-wide` 1320px pra grids de solução.
- **Ritmo vertical alternado:** `.section` = `clamp(72px, 8vw, 112px)` (seções utilitárias) vs `.section-impact` = `clamp(96px, 12vw, 168px)` (hero da home, soluções, Noryos OS, CTA final).
- Fundo alterna `--color-ink` ↔ `.surface-1` a cada seção; as seções de impacto quebram o padrão com `.tech-grid` / `SystemCanvas`.
- Header fixo de 72px (`--header-h`); a home usa `.hero-bleed` pra o fundo do hero passar sob o header transparente.

---

## Radius, elevação, bordas

- **Radius:** `--radius-sm` 8px (botões, inputs, chips retangulares) · `--radius-md` 12px (cards menores, FAQ) · `--radius-lg` 18px (cards principais, janelas) · `--radius-xl` 26px (blocos grandes).
- **Elevação:** 3 níveis (`--elev-1/2/3`) — sempre `inset 0 1px rgba(255,255,255,0.04–0.06)` + sombra difusa negativa. Discreta, **sem glow**.
- **Bordas:** 1px, `--hairline` padrão / `--hairline-strong` em hover-foco. Divisórias de grid via `gap-px` sobre `bg-[var(--hairline)]`.
- **Pill (100% arredondado):** permitido em chips, tags, badges, seletores de cenário e no botão flutuante do WhatsApp. **Botões de ação não são pills** — usam `--radius-sm`.

---

## Motion system

Sem Framer Motion (decisão mantida — dependências enxutas, performance como
sinal de competência). Tudo é CSS + SVG + hooks próprios em `src/lib/hooks.ts`
(`useInView`, `useScrollProgress`, `useMouseParallax`, `useSpotlight`).

### Tokens

- Durações: `--dur-1` 200ms (microinteração) · `--dur-2` 450ms · `--dur-3` 600ms (entrada de seção) · `--dur-4` 800ms (linhas / fills).
- Easing: `--ease-premium` `cubic-bezier(.22,1,.36,1)` · `--ease-soft` `cubic-bezier(.16,1,.3,1)`. Nunca bounce, nunca overshoot.

### Padrões nomeados (`[data-anim]` + `.is-in`)

| Nome | Efeito | Onde |
|---|---|---|
| `fade-up` | opacity 0→1 + translateY 32→0 | entrada de seção padrão |
| `fade` / `fade-left` | opacity, opcional translateX | variações laterais |
| `scale-in` | opacity + scale .965→1 | janela do Noryos OS, chips do SystemCanvas |
| `slide-reveal` | clip-path inset(100%→0) por linha | headlines (`AnimatedHeading`) |
| stagger | filhos entram em sequência via `--i` (passo 70ms, teto 6) | listas, grids, cadeias |
| `draw-line` | `stroke-dashoffset`→0 | conexões do SystemCanvas / FragmentGrid |
| `fill-bar` | `scaleX` 0→1 | barras do DiagnosticPreview |
| `flow-line` / `node-pulse` | pulso viajando pela conexão / nó pulsando | SystemCanvas (loop lento, ~3s) |
| scroll progress | trilho preenche conforme a seção cruza a viewport | SystemFlow, ProcessTimeline |
| parallax | `translate3d` por posição do mouse, em camadas | SystemCanvas (off em touch) |

### Regras

- **Gatilho dos reveals** (`useInView`): dispara quando o topo do elemento chega a ~65% da viewport (`rootMargin: 0 0 -35% 0`, sem `threshold`) — a entrada acontece com o conteúdo já no campo de visão, não no rodapé (o ajuste de 29/08/2026 que resolveu o "parece estático"). Nunca usar `threshold` alto: em blocos mais altos que a viewport a razão de interseção não é atingida e a animação não dispara (visto no mobile).
- `prefers-reduced-motion` (só casa em `reduce` explícito): mantém o fade de entrada — opacidade, sem deslocamento —, header, barras e count-up; desliga só o movimento de fato: parallax, loops de ambiente, pulso, brilho, barra de progresso. Sem JS, um `<noscript>` garante que `[data-anim]`/`.reveal` fiquem visíveis.
- Tablet: reduzir. Mobile: reduzir bastante — flows viram verticais, parallax e spotlight desligam.
- Nenhum autoplay caótico, nenhum scroll-jacking, nenhuma máquina de escrever / glitch / letras pulando.
- Legado: `ui/Reveal` (+ `.card-lift`, `.hero-rise`, `.site-header[data-scrolled]`) continua nas páginas internas. Padrão novo: `SectionReveal` / `Stagger` / `AnimatedHeading`.

---

## Componentes gráficos próprios

Desenhados pra Noryos, em `src/components/system/` e `src/components/ui/`:

- **SystemCanvas** — o "sistema vivo" do hero: 6 módulos (Presença, Aquisição, Automação=hub, Dados, Conteúdo, Evolução) como chips conectados; linhas que se desenham, pulsos, parallax. Reaproveitado esmaecido no CTA final (começa e termina no mesmo universo).
- **FragmentGrid** — partes soltas de uma operação que ganham conexões ao entrar na viewport.
- **SystemFlow** — fluxo Presença→…→Evolução, horizontal (desktop) / vertical (mobile), trilho que preenche no scroll.
- **NoryosOSExplorer** — janela de "software proprietário" (chrome + árvore de categorias + painel contextual). **Nunca** Windows Explorer literal; **nunca** expõe a estrutura interna real do `noryosinovacoes_OS`.
- **DiagnosticPreview** — mock do Diagnóstico Digital com barras que preenchem + selo **"Demonstração ilustrativa"** obrigatório.
- **ProcessTimeline** — "Como trabalhamos" como timeline que progride no scroll.
- **ApplicationScenarios** — cenários com seletor; cada um marcado **"Exemplo de aplicação"**.
- **BrowserPreview / AutomationFlow / MiniChart** — ilustrações abstratas dos cards de solução. Sem texto real, sem número de cliente.
- **SpotlightCard** — superfície de card padrão: gradiente sutil + hairline dupla + spotlight de baixa intensidade que segue o cursor (desktop). Sem efeito "gaming".
- **Icon** — set linear único, stroke 1.5, grid 24, sempre `aria-hidden`. Não misturar com outros estilos de ícone.

---

## Botões

- **Primário:** preenchimento ciano sólido, texto ink, `--radius-sm`. Hover: `brightness(1.1)` + subida de 2px + seta (`.btn-arrow`) desloca 3px. Sombra ciano discreta.
- **Secundário:** contorno `--hairline-strong` sobre transparente; hover vira ciano (borda + texto) + subida de 2px.
- **Ghost:** texto com sublinhado que muda de cor no hover — pra ações inline ("Ver solução →").
- CTA principal sempre **"Conversar sobre meu projeto"** → WhatsApp (`WhatsappCTA`, único ponto de saída). Secundários: "Conhecer as soluções", "Solicitar meu diagnóstico". Nunca "saiba mais" / "clique aqui" / "entre em contato".

---

## Header

Transparente sobre o hero. Depois de ~12px de scroll: fundo translúcido
(`color-mix` ink 78%) + `blur(14px)` + hairline inferior + sombra rasa.
Nav: Soluções · Noryos OS · Diagnóstico · Como funciona · Sobre + CTA
"Conversar". Mobile: painel full-height, links grandes, CTA full-width,
`body` trava o scroll enquanto aberto.

---

## O que NUNCA fazer

- Gradiente indigo/roxo, blob de gradiente, glassmorphism com glow neon, neon em excesso.
- Fileira de 3+ cards idênticos como estrutura principal de uma seção (usar composição assimétrica).
- Animar tudo; microanimação em excesso; bounce; scroll-jacking; efeito máquina de escrever / glitch.
- Partícula aleatória, estrelas, chuva de código, Matrix, esfera 3D genérica, cubos 3D.
- Vídeo de fundo, canvas pesado, WebGL/Three.js só por estética.
- Fonte minúscula; usar a mesma fonte pra título, corpo e UI.
- "Somos apaixonados pelo que fazemos", "revolucionamos seu negócio", "soluções 360", "agência completa", copy vazia típica de IA.
- Depoimento, cliente, logo, número, métrica ou selo inventado — mocks sempre rotulados como ilustrativos. Ver regra de credibilidade em `../decisoes-site.md`.
- Interface do Noryos OS parecendo Windows Explorer literal.
- Verde do WhatsApp gigante quebrando a identidade — só o badge do botão flutuante.

---

## Logo

> **Ativos oficiais recebidos em 29/08/2026.** Usar exatamente como
> fornecidos — não recortar, recolorir, re-exportar nem regenerar. O
> fallback tipográfico ("Noryos" + ponto ciano) foi aposentado.

### Arquivos (fonte de verdade: `site/`)

| Ativo | Caminho | Dimensão | Descrição |
|---|---|---|---|
| Assinatura horizontal | `site/public/noryos-logo.png` | 2172×724 (~3:1) | símbolo (fita "N" ciano→azul) + wordmark "Noryos / INOVAÇÕES" em branco. Fundo transparente |
| Símbolo / ícone | `site/public/noryos-icon.png` | 1254×1254 | só a fita "N", fundo transparente. Usado como favicon e no JSON-LD `Organization.logo` |
| Favicon clássico | `site/src/app/favicon.ico` | 16 / 32 / 48 | multi-resolução, reamostragem do símbolo. Cobre o caminho `/favicon.ico` |
| Favicon PNG (App Router) | `site/src/app/icon.png` | 512×512 | derivado do símbolo; o Next gera a `<link rel="icon">` |
| Ícone iOS (apple-touch) | `site/src/app/apple-icon.png` | 180×180 | derivado do símbolo (padrão Apple touch icon) |
| Open Graph / Twitter | `site/src/app/opengraph-image.png` + `twitter-image.png` | 1731×909 (~1,9:1) | arte composta dark: logo + headline "Tecnologia que conecta…" + lista de serviços + domínio, sobre fundo de rede/plexus. Fundo sólido (não transparente) |

### Onde aparece

- **Header** (`site/src/components/Header.tsx`): assinatura horizontal via
  `<Image>` do `next/image` — `h-9` (36px) até `lg`, `h-[52px]` no desktop
  (≥1024px); `w-auto` preserva a proporção 3:1. Altura do header
  (`--header-h` 72px) inalterada. Alinhada à borda do container, sem offset
  lateral (mesmo eixo do H1 do hero). `alt` = "Noryos Inovações".
- **Footer** (`Footer.tsx`): mesma assinatura, `h-9` mobile / `h-10` (40px)
  no desktop — menor que o header, ainda legível.
- **Favicon:** estratégia única = file-based metadata do App Router
  (`favicon.ico` + `icon.png` + `apple-icon.png` em `src/app/`). **Sem**
  `metadata.icons` no `layout.tsx` (evita `<link>` duplicados). Os 3 são
  gerados por `site/scripts/gen-favicon.mjs` a partir de
  `public/noryos-icon.png` — sem redesenhar, recolorir ou adicionar fundo.
- **Open Graph / Twitter Card:** automáticos a partir de
  `src/app/opengraph-image.png` / `twitter-image.png` (+ `.alt.txt`) — o
  Next injeta `og:image` / `twitter:image` com URL absoluta e dimensão.
  `twitter.card` = `summary_large_image`.
- **JSON-LD** (`site/src/lib/seo.ts`): `Organization.logo` aponta pra
  `noryos-icon.png` em URL absoluta.

### Regras de uso

- Wordmark é **branco** → só sobre fundo escuro (a identidade é dark-first).
  Sobre fundo claro, usar o símbolo isolado (`noryos-icon.png`) ou uma
  versão de wordmark escura (ainda não fornecida — pedir se precisar).
- Servido sem otimização (`images.unoptimized` no `next.config.mjs`) pra
  garantir o PNG byte a byte como recebido.
- Cache dos ícones e da logo (`.ico`/`.png` na raiz): `public,
  max-age=86400, stale-while-revalidate=604800` via `headers()` no
  `next.config.mjs` — sem cache de 1 ano durante o refino de identidade.
- Imagem de Open Graph: arte composta com **fundo sólido** (o wordmark
  transparente sozinho não serve como preview de compartilhamento).

---

## Observações adicionais

- Esta identidade é específica da Noryos Inovações. O `identidade/design-guide.md` da raiz do MazyOS continua vazio/genérico — não usar como referência pra este projeto.
- Se o nicho odontologia for confirmado no futuro, paleta, tipografia e metodologia (Noryos OS) se mantêm — só entra uma camada de mensagem por segmento (`/segmentos/odontologia`, ainda não criada).
