import type { IconName } from "@/components/ui/Icon";

/**
 * Dados das seções da Home. Texto fica aqui, não no JSX (regra do projeto).
 * Nada aqui é métrica real de cliente — os números do diagnóstico e os
 * cenários são ilustrativos e rotulados como tal na interface.
 */

/** §12 — partes de uma operação que costumam funcionar isoladas. */
export const fragmentos: { nome: string; icon: IconName }[] = [
  { nome: "Site", icon: "presenca" },
  { nome: "Anúncios", icon: "aquisicao" },
  { nome: "Leads", icon: "relacionamento" },
  { nome: "Conteúdo", icon: "conteudo" },
  { nome: "Atendimento", icon: "automacao" },
];

/** §13 — a mesma operação funcionando como sistema. */
export const fluxoSistema: { nome: string; icon: IconName; nota: string }[] = [
  { nome: "Presença Digital", icon: "presenca", nota: "A base onde tudo se apoia" },
  { nome: "Aquisição", icon: "aquisicao", nota: "Pessoas certas chegando" },
  { nome: "Relacionamento", icon: "relacionamento", nota: "Conversa que não se perde" },
  { nome: "Automação", icon: "automacao", nota: "Sem depender de memória" },
  { nome: "Dados", icon: "dados", nota: "Decisão com evidência" },
  { nome: "Evolução", icon: "evolucao", nota: "Próximo passo com prioridade" },
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
