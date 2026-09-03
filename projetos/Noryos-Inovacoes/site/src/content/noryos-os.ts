import type { IconName } from "@/components/ui/Icon";

export type NoryosOSModule = {
  nome: string;
  icon: IconName;
  descricao: string;
  itens: string[];
};

/**
 * Abstração comercial do Noryos OS — NUNCA expor aqui a estrutura real
 * interna do noryosinovacoes_OS (memória, skills, scripts, prompts).
 * Isso é a metodologia contada pro cliente, não o repositório de verdade.
 * Nada aqui é "funcionalidade de produto" — é como o trabalho é organizado.
 */
export const noryosOSModules: NoryosOSModule[] = [
  {
    nome: "Presença Digital",
    icon: "presenca",
    descricao: "Site, páginas e canais que representam a empresa online.",
    itens: ["Estrutura do site", "Landing pages", "Experiência mobile", "Evolução contínua"],
  },
  {
    nome: "Aquisição",
    icon: "aquisicao",
    descricao: "Como novas pessoas chegam até o negócio.",
    itens: ["Campanhas ativas", "Rastreamento configurado", "Canais testados", "Leitura de retorno"],
  },
  {
    nome: "Conteúdo",
    icon: "conteudo",
    descricao: "O que é comunicado, e em quais canais.",
    itens: ["Linha editorial", "Calendário", "Materiais por canal", "Consistência da mensagem"],
  },
  {
    nome: "Automações",
    icon: "automacao",
    descricao: "O que passou a acontecer sem depender de alguém lembrar.",
    itens: ["Fluxos", "Integrações", "Follow-ups", "Regras operacionais"],
  },
  {
    nome: "Dados",
    icon: "dados",
    descricao: "O que está sendo medido, e por quê.",
    itens: ["Métricas acompanhadas", "Fontes conectadas", "Leitura periódica", "Base pra decisão"],
  },
  {
    nome: "Documentação",
    icon: "documentacao",
    descricao: "Registro do que foi decidido e construído.",
    itens: ["Decisões", "Processos", "Histórico", "Próximos passos"],
  },
  {
    nome: "Evolução",
    icon: "evolucao",
    descricao: "O que vem a seguir, com prioridade definida.",
    itens: ["Próximos passos", "Oportunidades mapeadas", "Prioridade do momento", "Ajustes com dado"],
  },
];
