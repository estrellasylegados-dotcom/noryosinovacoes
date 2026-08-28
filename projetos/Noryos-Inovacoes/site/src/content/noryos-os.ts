export type NoryosOSFolder = {
  nome: string;
  descricao: string;
  itens: string[];
};

/**
 * Abstração comercial do Noryos OS — NUNCA expor aqui a estrutura real
 * interna do noryosinovacoes_OS (memória, skills, scripts, prompts).
 * Isso é a metodologia contada pro cliente, não o repositório de verdade.
 */
export const noryosOSFolders: NoryosOSFolder[] = [
  {
    nome: "Presença Digital",
    descricao: "Site, páginas e canais que representam a empresa online.",
    itens: ["Estrutura do site", "Landing pages", "Experiência mobile"],
  },
  {
    nome: "Aquisição",
    descricao: "Como novas pessoas chegam até o negócio.",
    itens: ["Campanhas ativas", "Tracking configurado", "Canais testados"],
  },
  {
    nome: "Conteúdo",
    descricao: "O que é comunicado e em quais canais.",
    itens: ["Linha editorial", "Calendário", "Materiais de comunicação"],
  },
  {
    nome: "Automações",
    descricao: "O que passou a acontecer sem depender de alguém lembrar.",
    itens: ["Atendimento", "Fluxos internos", "Integrações"],
  },
  {
    nome: "Dados",
    descricao: "O que está sendo medido e por quê.",
    itens: ["Métricas acompanhadas", "Fontes conectadas"],
  },
  {
    nome: "Documentação",
    descricao: "Registro do que foi decidido e construído.",
    itens: ["Decisões do projeto", "Acessos e responsáveis"],
  },
  {
    nome: "Evolução",
    descricao: "O que vem a seguir, com prioridade definida.",
    itens: ["Próximos passos", "Oportunidades identificadas"],
  },
];
