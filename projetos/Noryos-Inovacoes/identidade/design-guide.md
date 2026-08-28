# Identidade visual — Noryos Inovações

> **Revisado em 27/08/2026** a partir do briefing mestre de posicionamento
> (ver `../decisoes-site.md`). Esta versão **substitui** a direção anterior
> ("Grafite + Esmeralda", editorial/agência) porque o posicionamento mudou:
> a Noryos deve parecer empresa de tecnologia e soluções digitais, não
> agência de marketing. A versão anterior fica registrada no histórico do
> git, não duplicada aqui.

---

## Cores

- **Fundo principal (ink):** `#0B0D10`
- **Fundo secundário / seções alternadas:** `#111820`
- **Fundo de cards:** `#12171D`
- **Texto principal:** `#F5F7FA`
- **Texto secundário:** `#A7B0BA`
- **Cor tecnológica principal (destaque/CTA):** `#2DD4FF` (ciano)
- **Cor secundária (status/automação, uso moderado):** `#43E6A6` (verde)
- **Cor proibida:** gradiente indigo→roxo, azul-SaaS genérico, uso de neon em excesso (o site é escuro e sofisticado, não neon)

## Tipografia

- **Títulos e destaques:** Space Grotesk (geométrica, técnica, confiante) — via `next/font/google`
- **Corpo, subtítulos e botões:** Inter — via `next/font/google`
- **Peso do título:** 500 (medium) — evitar bold/black, que puxa pra "banner"

## Estilo geral

- Dark-first, premium, tecnológico, limpo, bastante respiro
- Grid técnico sutil (linhas finas) em vez de gradiente ou blob
- Nós/linhas conectados (SVG + CSS) representando "sistema em funcionamento" — nunca partícula aleatória genérica
- Motion contido: microinterações em cards, scroll suave, `prefers-reduced-motion` sempre respeitado
  - Padrão implementado no site (seguir nas próximas páginas): scroll-reveal com leve
    stagger entre itens de uma mesma lista/grid (componente `ui/Reveal`, prop `delay`);
    header ganha sombra/borda sutil depois de ~8px de rolagem (`.site-header[data-scrolled]`);
    `hero-rise` (fade-up escalonado do hero no load); `.card-lift` (elevação de ~3px no
    hover, só em dispositivos com mouse). Nada disso roda sob `prefers-reduced-motion`.
- Hierarquia visual por prioridade comercial, não por estética — Presença Digital sempre aparece com mais peso que os demais serviços

## Elementos-chave

- Bordas: 1px, `rgba(167,176,186,0.14)` (padrão) ou `0.28` (forte, hover/foco)
- Border-radius: 6px (botões/inputs), 10px (cards), 16px (blocos grandes)
- Botões: preenchimento ciano sólido (primário) ou contorno (secundário) — nunca pill totalmente arredondado
- Sombras: discretas, sem glow (`0 12px 24px -16px rgba(0,0,0,0.6)`)

## O que NUNCA fazer

- Gradiente indigo/roxo, glassmorphism com glow neon
- Fileira de 3 (ou mais) cards idênticos como estrutura principal de uma seção
- "Somos apaixonados pelo que fazemos", "revolucionamos seu negócio", "soluções 360", "agência completa"
- Depoimento, cliente, logo, número ou selo inventado — ver regra de credibilidade no briefing mestre
- Interface do Noryos OS parecendo Windows Explorer literal

## Logo

- **Arquivo:** ainda não existe — fallback tipográfico ("Noryos.", Space Grotesk) usado em todo o site
- **Onde plugar quando existir:** `site/src/components/Header.tsx` e `Footer.tsx` (hoje renderizam o fallback tipográfico)
- **Favicon:** placeholder padrão do Next.js em `site/src/app/favicon.ico` — trocar antes de publicar

## Observações adicionais

- Esta identidade é específica da Noryos Inovações. O `identidade/design-guide.md` da raiz do MazyOS continua vazio/genérico — não usar como referência pra este projeto.
- Se o nicho odontologia for confirmado no futuro, a paleta e a metodologia (Noryos OS) se mantêm — só entra uma camada de mensagem por segmento (`/segmentos/odontologia`, ainda não criada).
