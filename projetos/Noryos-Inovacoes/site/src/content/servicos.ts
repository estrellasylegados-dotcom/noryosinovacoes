export type Servico = {
  slug: string;
  titulo: string;
  tag: string;
  problema: string;
  solucao: string;
  beneficio: string;
  href?: string; // só existe quando há landing page dedicada
};

/**
 * Ordem = prioridade comercial (seção 4 do briefing). Não reordenar sem
 * atualizar também a Home e o menu — a hierarquia é decisão de posicionamento,
 * não estética.
 */
export const servicos: Servico[] = [
  {
    slug: "presenca-digital",
    titulo: "Presença Digital",
    tag: "Base de tudo",
    problema:
      "Muita empresa tem site, mas não tem uma base digital que sustenta o resto — não converte, não carrega bem no celular, não guia o visitante a lugar nenhum.",
    solucao:
      "Sites e páginas comerciais pensados como estrutura, não como cartão de visita: rápidos, claros, com experiência mobile de verdade e caminho definido até o contato.",
    beneficio: "Uma base que o resto da operação (anúncio, automação, conteúdo) pode se apoiar.",
    href: "/solucoes/sites",
  },
  {
    slug: "automacao",
    titulo: "Automação",
    tag: "Diferencial",
    problema:
      "Lead manda mensagem e espera até o outro dia. Processo interno depende de alguém lembrar de fazer manualmente.",
    solucao:
      "Automação de atendimento, integrações e fluxos — do WhatsApp a processos internos — organizando o que hoje depende de memória e boa vontade.",
    beneficio: "Resposta mais rápida pro cliente, menos trabalho repetitivo pra sua equipe.",
    href: "/solucoes/automacoes",
  },
  {
    slug: "aquisicao-performance",
    titulo: "Aquisição e Performance",
    tag: "Crescimento mensurável",
    problema:
      "Anúncio rodando sem tracking direito é dinheiro girando sem ninguém saber se voltou.",
    solucao:
      "Campanhas em Google e Meta com rastreamento configurado desde o início, otimizadas com dado real — não com achismo.",
    beneficio: "Clareza de quanto entra, quanto sai e o que está de fato gerando retorno.",
    href: "/solucoes/performance",
  },
  {
    slug: "conteudo-e-presenca",
    titulo: "Conteúdo e Presença",
    tag: "Consistência",
    problema:
      "Postar sem direção enche o feed, mas não constrói autoridade nem gera conversa comercial.",
    solucao:
      "Planejamento de conteúdo, criativos e gestão de redes sociais alinhados ao mesmo posicionamento do resto da operação — redes sociais como parte do sistema, não como vitrine isolada.",
    beneficio: "Presença que reforça a mesma mensagem em todos os canais, sem trabalho avulso.",
  },
];

export function getServicoPorSlug(slug: string) {
  return servicos.find((s) => s.slug === slug);
}
