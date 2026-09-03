import type { WhatsappPreset } from "@/lib/config";

export type SolucaoDetalhe = {
  slug: string;
  nome: string;
  titulo: string;
  subtitulo: string;
  problema: string;
  oportunidade: string;
  solucao: string;
  /** O que pode entrar no projeto, conforme o escopo. */
  entregas: string[];
  mecanismo: { titulo: string; descricao: string }[];
  demonstracao: { situacao: string; solucao: string; estrutura: string; resultadoEsperado: string };
  objecoes: { pergunta: string; resposta: string }[];
  /** Preset de mensagem do WhatsApp usado nos CTAs desta página. */
  whatsapp: WhatsappPreset;
};

/**
 * Páginas internas de solução = aprofundamento COMERCIAL das portas da
 * /solucoes, não página técnica. Sem preço, sem promessa de resultado.
 * CTA primário sempre WhatsApp (mensagem contextual); Diagnóstico Digital
 * como secundário.
 */
export const solucoesDetalhe: Record<string, SolucaoDetalhe> = {
  sites: {
    slug: "sites",
    nome: "Sites e Presença Web",
    titulo: "Sites e páginas comerciais que conduzem o visitante até o contato",
    subtitulo:
      "Antes de anunciar ou automatizar, a empresa precisa de uma base digital que apresenta bem o negócio e leva à ação — não que só existe.",
    problema:
      "Muito site é bonito na tela do computador e invisível no celular do cliente. Carrega devagar, não deixa claro o que a empresa faz e não oferece um caminho para contato, orçamento ou agendamento.",
    oportunidade:
      "Uma base digital bem construída vira o ponto de apoio de tudo: anúncio, presença no Google e automação funcionam melhor quando têm para onde levar o visitante.",
    solucao:
      "Site institucional, landing page ou reestruturação do que já existe — com experiência mobile de verdade, informação clara, páginas de serviço e integração com WhatsApp. Construído como estrutura comercial, não como vitrine estática.",
    entregas: [
      "Site institucional ou landing page",
      "Reestruturação de site existente",
      "Arquitetura da informação",
      "Experiência mobile",
      "Páginas de serviços",
      "Integração com WhatsApp",
      "Formulários de contato",
      "Base de SEO técnico",
      "Analytics",
      "Estrutura pronta para campanhas",
    ],
    mecanismo: [
      {
        titulo: "Experiência mobile",
        descricao: "A maioria do tráfego chega pelo celular — a página precisa funcionar bem lá primeiro.",
      },
      {
        titulo: "Clareza da oferta",
        descricao: "O visitante entende o que a empresa faz e para quem, sem precisar procurar.",
      },
      {
        titulo: "Caminho até o contato",
        descricao: "Cada página leva a uma ação clara: WhatsApp, orçamento ou agendamento.",
      },
    ],
    demonstracao: {
      situacao: "Prestador de serviço local com site antigo, lento e sem canal de contato direto.",
      solucao: "Página nova, rápida, com WhatsApp centralizado e estrutura pensada para conversão.",
      estrutura: "Site documentado dentro do Noryos OS do projeto, pronto para evoluir com aquisição e automação depois.",
      resultadoEsperado: "Mais visitantes completando o contato — a validar com dado real após o lançamento.",
    },
    objecoes: [
      {
        pergunta: "Já tenho um site, preciso trocar tudo?",
        resposta: "Nem sempre. Muitas vezes dá para corrigir estrutura, velocidade e conversão sem reconstruir do zero.",
      },
      {
        pergunta: "Site bonito não é suficiente?",
        resposta: "Bonito ajuda, mas sem estrutura de conversão o visitante entra e sai sem deixar contato.",
      },
    ],
    whatsapp: "site",
  },
  automacoes: {
    slug: "automacoes",
    nome: "Automação e Integrações",
    titulo: "Automação que organiza o atendimento e os processos internos",
    subtitulo:
      "O que hoje depende de alguém lembrar de fazer manualmente pode virar parte do sistema — sem deixar o cliente esperando.",
    problema:
      "Lead manda mensagem no fim do dia e só recebe resposta no outro dia útil. Processo interno trava porque depende de uma pessoa específica lembrar de um passo específico.",
    oportunidade:
      "Automação bem configurada reduz o tempo de resposta, evita perda de contato e libera a equipe para o que exige julgamento humano de verdade.",
    solucao:
      "Automação de atendimento (WhatsApp incluído), integrações entre as ferramentas que a empresa já usa e organização de fluxos internos — com inteligência artificial quando fizer sentido para o caso, não por modismo.",
    entregas: [
      "Atendimento inicial automatizado",
      "Respostas e triagem no WhatsApp",
      "Integração entre ferramentas existentes",
      "Conexão com CRM",
      "Follow-up automático",
      "Organização de fluxos internos",
      "Regras operacionais documentadas",
    ],
    mecanismo: [
      {
        titulo: "Primeira resposta na hora",
        descricao: "Atendimento inicial automático que qualifica e direciona, sem deixar o contato esperando.",
      },
      {
        titulo: "Ferramentas conversando",
        descricao: "O que já existe integrado, sem retrabalho manual de copiar e colar.",
      },
      {
        titulo: "Nada depende de memória",
        descricao: "Processos repetitivos organizados para não depender de uma pessoa lembrar.",
      },
    ],
    demonstracao: {
      situacao: "Empresa que recebe contatos por WhatsApp mas demora horas para responder fora do horário comercial.",
      solucao: "Fluxo de atendimento automatizado para a primeira resposta e a triagem inicial.",
      estrutura: "Automação documentada e integrada ao restante da operação digital do cliente.",
      resultadoEsperado: "Redução no tempo até a primeira resposta — a validar com dado real após a implementação.",
    },
    objecoes: [
      {
        pergunta: "Automação vai deixar o atendimento robótico?",
        resposta: "O objetivo é agilizar o começo da conversa, não substituir o humano nas decisões que importam.",
      },
      {
        pergunta: "Preciso trocar minhas ferramentas atuais?",
        resposta: "Na maioria dos casos, não — o foco é integrar o que já existe.",
      },
    ],
    whatsapp: "automacao",
  },
  performance: {
    slug: "performance",
    nome: "Tráfego Pago e Aquisição",
    titulo: "Tráfego pago com rastreamento desde o primeiro clique",
    subtitulo:
      "Colocar a empresa diante de quem tem potencial de virar cliente — com dado para saber o que funciona, não achismo.",
    problema:
      "Anúncio rodando sem estrutura de rastreamento parece estar funcionando (ou não) sem nenhum dado que sustente essa impressão. O clique chega, o contato não.",
    oportunidade:
      "Com tracking correto desde o início, cada real investido em Google Ads ou Meta Ads pode ser avaliado com clareza: o que otimizar, o que pausar, o que escalar.",
    solucao:
      "Diagnóstico inicial, estratégia de aquisição, campanhas em Google Ads e Meta Ads com tracking configurado, segmentação, landing pages quando necessário, acompanhamento recorrente e relatórios que viram decisão.",
    entregas: [
      "Diagnóstico inicial de aquisição",
      "Estratégia de canais",
      "Campanhas em Google Ads",
      "Campanhas em Meta Ads",
      "Segmentação de público",
      "Rastreamento e conversões",
      "Landing pages quando necessário",
      "Acompanhamento e otimização",
      "Relatórios e decisões baseadas em dados",
    ],
    mecanismo: [
      {
        titulo: "Rastreamento configurado",
        descricao: "Conversões mapeadas desde o início, não adicionadas depois às pressas.",
      },
      {
        titulo: "Otimização contínua",
        descricao: "Ajustes com base no que o dado mostra, não em média de mercado.",
      },
      {
        titulo: "Decisão com relatório",
        descricao: "Relato claro do que está funcionando e do que precisa mudar.",
      },
    ],
    demonstracao: {
      situacao: "Empresa que testou anúncio sozinha e gastou o orçamento do mês sem conseguir medir o retorno.",
      solucao: "Campanha reestruturada com tracking correto e prioridade de investimento redefinida.",
      estrutura: "Aquisição documentada como parte do Noryos OS do projeto, conectada à presença digital existente.",
      resultadoEsperado: "Clareza sobre custo por contato e origem de cada oportunidade — a validar com dado real da conta.",
    },
    objecoes: [
      {
        pergunta: "A verba dos anúncios está incluída?",
        resposta: "Não. O investimento em mídia é pago diretamente às plataformas. A Noryos cuida de estratégia, estruturação, acompanhamento e otimização.",
      },
      {
        pergunta: "Tráfego pago funciona para qualquer negócio?",
        resposta: "Depende do objetivo e da estrutura de conversão que já existe — por isso o diagnóstico vem antes da campanha. E não prometemos faturamento.",
      },
    ],
    whatsapp: "trafego",
  },
};
