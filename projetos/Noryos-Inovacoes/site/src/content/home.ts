import type { IconName } from "@/components/ui/Icon";

/**
 * Dados das seções da Home. Texto fica aqui, não no JSX (regra do projeto).
 * Nada aqui é métrica real de cliente — os números do diagnóstico e os
 * cenários são ilustrativos e rotulados como tal na interface.
 */

/**
 * §14 (card Automação) — esteira "um lead percorrendo o fluxo":
 * Lead → WhatsApp → CRM → Follow-up. `status` é o microstatus que pisca
 * quando a etapa acende; `descricao` é o tooltip de hover (desktop).
 * Ilustrativo — não representa integração real de cliente.
 */
export const fluxoAutomacao: {
  id: "lead" | "whatsapp" | "crm" | "followup";
  nome: string;
  icon: IconName;
  status: string;
  descricao: string;
}[] = [
  {
    id: "lead",
    nome: "Lead",
    icon: "relacionamento",
    status: "novo contato",
    descricao: "Um contato novo chega — formulário do site, anúncio ou indicação.",
  },
  {
    id: "whatsapp",
    nome: "WhatsApp",
    icon: "automacao",
    status: "mensagem enviada",
    descricao: "Resposta automática na hora, sem depender de alguém lembrar de responder.",
  },
  {
    id: "crm",
    nome: "CRM",
    icon: "dados",
    status: "contato registrado",
    descricao:
      "O contato entra organizado no funil, com histórico — não fica perdido numa caixa de entrada.",
  },
  {
    id: "followup",
    nome: "Follow-up",
    icon: "evolucao",
    status: "próxima ação agendada",
    descricao: "A próxima ação já fica agendada. Nenhum lead esfria por esquecimento.",
  },
];

/**
 * §14 (card Aquisição e Performance) — painel de leitura: investimento vs.
 * retorno em índice relativo (base 100) ao longo de 8 semanas, 3 indicadores
 * direcionais com sparkline e um ponto de decisão. ILUSTRATIVO — índice
 * relativo, sem número absoluto e sem dado de cliente. `delta` é variação
 * percentual demonstrativa; `sentido` diz se a variação é positiva pro
 * negócio (verde), independente do sinal.
 */
export const aquisicaoPainel = {
  investimento: [100, 103, 107, 110, 114, 117, 121, 124],
  retorno: [94, 100, 110, 119, 132, 145, 158, 174],
  decisao: { semana: 4, rotulo: "ponto de decisão" },
  kpis: [
    { id: "cpl", label: "Custo / lead", delta: -12, sentido: "bom", spark: [72, 66, 61, 57, 52, 48] },
    { id: "conv", label: "Conversão", delta: 9, sentido: "bom", spark: [38, 41, 44, 49, 54, 60] },
    { id: "retorno", label: "Retorno", delta: 23, sentido: "bom", spark: [40, 48, 57, 66, 79, 94] },
  ],
} as const;

/**
 * §2/§3 — "operação fragmentada → conectada". Coordenadas no palco SVG
 * 0..100 (x) × 0..66 (y). `frag` = espalhado e desconectado; `sys` =
 * organizado, com o Noryos OS orquestrando no topo.
 */
export const operacaoNos: {
  id: string;
  label: string;
  icon: IconName;
  frag: { x: number; y: number };
  sys: { x: number; y: number };
}[] = [
  { id: "os", label: "Noryos OS", icon: "spark", frag: { x: 27, y: 53 }, sys: { x: 50, y: 7 } },
  { id: "site", label: "Site", icon: "presenca", frag: { x: 14, y: 11 }, sys: { x: 18, y: 25 } },
  { id: "conteudo", label: "Conteúdo", icon: "conteudo", frag: { x: 12, y: 35 }, sys: { x: 50, y: 23 } },
  { id: "anuncios", label: "Anúncios", icon: "aquisicao", frag: { x: 87, y: 11 }, sys: { x: 82, y: 25 } },
  { id: "leads", label: "Leads", icon: "relacionamento", frag: { x: 49, y: 28 }, sys: { x: 50, y: 39 } },
  { id: "atend", label: "Atendimento", icon: "automacao", frag: { x: 88, y: 44 }, sys: { x: 50, y: 50 } },
  { id: "dados", label: "Dados", icon: "dados", frag: { x: 66, y: 54 }, sys: { x: 50, y: 60 } },
];

/**
 * Conexões da §2/§3. `frag` = como a conexão aparece no estado fragmentado:
 * "none" (ainda não existe), "thin" (existe, fina/frouxa), "broken" (começa
 * e não chega). `order` (0..1) escalona a formação durante a transição.
 */
export const operacaoConexoes: {
  from: string;
  to: string;
  frag: "none" | "thin" | "broken";
  order: number;
}[] = [
  { from: "os", to: "site", frag: "none", order: 0.0 },
  { from: "os", to: "conteudo", frag: "none", order: 0.06 },
  { from: "os", to: "anuncios", frag: "none", order: 0.12 },
  { from: "site", to: "leads", frag: "thin", order: 0.22 },
  { from: "conteudo", to: "leads", frag: "broken", order: 0.28 },
  { from: "anuncios", to: "leads", frag: "broken", order: 0.34 },
  { from: "leads", to: "atend", frag: "broken", order: 0.46 },
  { from: "atend", to: "dados", frag: "none", order: 0.58 },
];

/**
 * §14 (card Presença Digital) — a jornada que uma página conduz: o visitante
 * desce por Hero → Prova → Oferta e é levado até o Contato. Mesma jornada no
 * desktop e no mobile (sincronizados). ILUSTRATIVO — sem texto real, sem
 * número.
 */
export const presencaJornada: { id: "hero" | "prova" | "oferta" | "contato"; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "prova", label: "Prova" },
  { id: "oferta", label: "Oferta" },
  { id: "contato", label: "Contato" },
];

/**
 * §14 (card Conteúdo e Presença) — uma mensagem central distribuída e
 * adaptada para os canais: Site, Instagram, Google, WhatsApp. `format` = a
 * silhueta do formato que a mensagem ganha naquele canal. ILUSTRATIVO — sem
 * post fictício, sem logo de plataforma.
 */
export const conteudoCanais: {
  id: "site" | "instagram" | "google" | "whatsapp";
  label: string;
  format: "page" | "square" | "search" | "chat";
}[] = [
  { id: "site", label: "Site", format: "page" },
  { id: "instagram", label: "Instagram", format: "square" },
  { id: "google", label: "Google", format: "search" },
  { id: "whatsapp", label: "WhatsApp", format: "chat" },
];

/** §5/§6 — módulos do sistema no hero. */
export const modulosHero = [
  "Presença",
  "Aquisição",
  "Automação",
  "Dados",
  "Conteúdo",
  "Evolução",
] as const;

/** §18 — mock do Diagnóstico Digital. Ilustrativo. */
export const diagnosticoMock = {
  metricas: [
    { label: "Presença Digital", valor: 72 },
    { label: "Conversão", valor: 51 },
    { label: "Automação", valor: 32 },
    { label: "Performance", valor: 64 },
  ],
  oportunidades: [
    "Melhorar conversão no mobile",
    "Estruturar o atendimento",
    "Melhorar a aquisição paga",
  ],
};

/** §19 — como trabalhamos. */
export const processo: { n: string; titulo: string; descricao: string; icon: IconName }[] = [
  { n: "01", titulo: "Entendemos", descricao: "Negócio, processos e objetivos antes de qualquer proposta.", icon: "node" },
  { n: "02", titulo: "Planejamos", descricao: "Estratégia e a solução certa pra prioridade do momento.", icon: "dados" },
  { n: "03", titulo: "Construímos", descricao: "Desenvolvimento e implementação, documentados no Noryos OS.", icon: "automacao" },
  { n: "04", titulo: "Acompanhamos", descricao: "Medimos o que foi feito e ajustamos com dado real.", icon: "evolucao" },
];

/** §20 — cenários demonstrativos. Sempre rotulados "Exemplo de aplicação". */
export const cenarios: { id: string; titulo: string; contexto: string; etapas: string[] }[] = [
  {
    id: "servicos",
    titulo: "Empresa de serviços",
    contexto: "Depende de indicação e de responder rápido no WhatsApp.",
    etapas: ["Google", "Landing Page", "WhatsApp", "Automação", "Atendimento", "Venda"],
  },
  {
    id: "ecommerce",
    titulo: "E-commerce",
    contexto: "Tráfego pago rodando sem estrutura de conversão clara.",
    etapas: ["Anúncio", "Página de produto", "Carrinho", "Recuperação", "Checkout", "Pós-venda"],
  },
  {
    id: "local",
    titulo: "Prestador local",
    contexto: "Site antigo, sem mobile e sem canal de contato direto.",
    etapas: ["Busca local", "Site novo", "WhatsApp", "Agendamento", "Lembrete", "Retorno"],
  },
];

/** §21 — por que Noryos. */
export const porQueNoryos: { titulo: string; descricao: string }[] = [
  { titulo: "Estratégia antes da ferramenta", descricao: "Primeiro o problema fica claro. A ferramenta é consequência, não ponto de partida." },
  { titulo: "Estrutura antes da entrega", descricao: "Cada projeto nasce organizado pra ter continuidade — não termina numa pasta perdida." },
  { titulo: "Integração", descricao: "Presença, aquisição, automação e conteúdo puxando pro mesmo lado, não em silos." },
  { titulo: "Visibilidade", descricao: "Você entende o que foi construído e por quê. Sem caixa-preta." },
  { titulo: "Evolução", descricao: "O que é entregue já é pensado pra crescer, com o próximo passo priorizado." },
  { titulo: "Transparência", descricao: "Clareza sobre o que já está pronto e o que ainda está em construção — sem case inventado pra parecer maior." },
];
