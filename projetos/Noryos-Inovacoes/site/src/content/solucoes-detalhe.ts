export type SolucaoDetalhe = {
  slug: string;
  nome: string;
  titulo: string;
  subtitulo: string;
  problema: string;
  oportunidade: string;
  solucao: string;
  mecanismo: { titulo: string; descricao: string }[];
  demonstracao: { situacao: string; solucao: string; estrutura: string; resultadoEsperado: string };
  objecoes: { pergunta: string; resposta: string }[];
};

export const solucoesDetalhe: Record<string, SolucaoDetalhe> = {
  sites: {
    slug: "sites",
    nome: "Presença Digital",
    titulo: "Sites e páginas comerciais que sustentam o resto da operação",
    subtitulo:
      "Antes de qualquer anúncio ou automação, a empresa precisa de uma base digital que converte — não só que existe.",
    problema:
      "Muito site é bonito na tela do designer e invisível no celular do cliente. Carrega devagar, não explica a oferta com clareza e não leva a lugar nenhum depois que a pessoa chega.",
    oportunidade:
      "Uma base digital bem construída vira o ponto de apoio de tudo — anúncio, automação e conteúdo funcionam melhor quando têm pra onde levar o visitante.",
    solucao:
      "Sites e landing pages com foco em experiência mobile, clareza da oferta e caminho direto até o contato — construídos pra servir de estrutura, não de vitrine estática.",
    mecanismo: [
      { titulo: "Experiência mobile", descricao: "A maioria do tráfego chega pelo celular — a página precisa funcionar bem lá primeiro." },
      { titulo: "Clareza da oferta", descricao: "O visitante entende o que a empresa faz e pra quem, sem precisar procurar." },
      { titulo: "Caminho de conversão", descricao: "Cada página leva a uma ação clara — contato, WhatsApp ou diagnóstico." },
    ],
    demonstracao: {
      situacao: "Prestador de serviço local com site antigo, lento e sem canal de contato claro.",
      solucao: "Página nova, rápida, com WhatsApp centralizado e estrutura pensada pra conversão.",
      estrutura: "Site documentado dentro do Noryos OS do projeto, pronto pra evoluir com automação depois.",
      resultadoEsperado: "Mais visitantes completando o contato — a validar com dado real após o lançamento.",
    },
    objecoes: [
      { pergunta: "Já tenho um site, preciso trocar tudo?", resposta: "Nem sempre. Muitas vezes dá pra corrigir estrutura e velocidade sem reconstruir do zero." },
      { pergunta: "Site bonito não é suficiente?", resposta: "Bonito ajuda, mas sem estrutura de conversão o visitante entra e sai sem deixar contato." },
    ],
  },
  automacoes: {
    slug: "automacoes",
    nome: "Automação",
    titulo: "Automação que organiza atendimento e processos internos",
    subtitulo: "O que hoje depende de alguém lembrar de fazer manualmente pode virar parte do sistema.",
    problema:
      "Lead manda mensagem no fim do dia e só recebe resposta no outro dia útil. Processo interno trava porque depende de uma pessoa específica lembrar de um passo específico.",
    oportunidade:
      "Automação bem configurada reduz tempo de resposta, evita perda de lead e libera a equipe pra tarefas que exigem julgamento humano de verdade.",
    solucao:
      "Automação de atendimento (WhatsApp incluído), integrações entre ferramentas e organização de fluxos internos — com inteligência artificial quando fizer sentido pro caso, não por modismo.",
    mecanismo: [
      { titulo: "Atendimento inicial", descricao: "Primeira resposta automática que qualifica e direciona, sem deixar o lead esperando." },
      { titulo: "Integrações", descricao: "Ferramentas que já existem conversando entre si, sem retrabalho manual." },
      { titulo: "Fluxos internos", descricao: "Processos repetitivos organizados pra não depender de memória de uma pessoa só." },
    ],
    demonstracao: {
      situacao: "Empresa que recebe leads por WhatsApp mas demora horas pra responder fora do horário comercial.",
      solucao: "Fluxo de atendimento automatizado pra primeira resposta e triagem inicial.",
      estrutura: "Automação documentada e integrada ao restante da operação digital do cliente.",
      resultadoEsperado: "Redução no tempo até a primeira resposta — a validar com dado real após implementação.",
    },
    objecoes: [
      { pergunta: "Automação vai deixar o atendimento robótico?", resposta: "O objetivo é agilizar o começo da conversa, não substituir o humano nas decisões que importam." },
      { pergunta: "Preciso trocar minhas ferramentas atuais?", resposta: "Na maioria dos casos, não — o foco é integrar o que já existe." },
    ],
  },
  performance: {
    slug: "performance",
    nome: "Aquisição e Performance",
    titulo: "Aquisição com rastreamento desde o primeiro clique",
    subtitulo: "Campanha sem tracking configurado é dinheiro girando sem ninguém saber se voltou.",
    problema:
      "Anúncio rodando sem estrutura de rastreamento faz parecer que está funcionando (ou não) sem dado nenhum que sustente essa impressão.",
    oportunidade:
      "Com tracking correto desde o início, cada real investido em Google ou Meta Ads pode ser avaliado com clareza — o que otimizar, o que pausar, o que escalar.",
    solucao:
      "Campanhas em Google Ads e Meta Ads com tracking configurado, otimização orientada por dado real e análise de desempenho recorrente — não configuração única e esquecida.",
    mecanismo: [
      { titulo: "Tracking configurado", descricao: "Conversões mapeadas desde o início, não adicionadas depois às pressas." },
      { titulo: "Otimização contínua", descricao: "Ajustes baseados no que o dado mostra, não em achismo ou média de mercado." },
      { titulo: "Análise de desempenho", descricao: "Relato claro do que está funcionando e do que precisa mudar." },
    ],
    demonstracao: {
      situacao: "Empresa que testou anúncio sozinha e gastou o orçamento do mês sem conseguir medir o retorno.",
      solucao: "Campanha reestruturada com tracking correto e prioridade de investimento redefinida.",
      estrutura: "Aquisição documentada como parte do Noryos OS do projeto, conectada à presença digital existente.",
      resultadoEsperado: "Clareza sobre custo por lead e origem de cada contato — a validar com dado real da conta.",
    },
    objecoes: [
      { pergunta: "Preciso de um orçamento alto pra começar?", resposta: "O ponto de partida é entender objetivo e contexto antes de qualquer valor — não existe piso fixo." },
      { pergunta: "Tráfego pago funciona pra qualquer negócio?", resposta: "Depende do objetivo e da estrutura de conversão já existente — por isso o diagnóstico vem antes da campanha." },
    ],
  },
};
