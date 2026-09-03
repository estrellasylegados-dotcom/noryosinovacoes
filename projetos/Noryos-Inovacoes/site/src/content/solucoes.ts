import type { IconName } from "@/components/ui/Icon";
import type { WhatsappPreset } from "@/lib/config";
import type { FaqItem } from "@/content/faq";

/**
 * Conteúdo da página comercial /solucoes. Texto fica aqui, não no JSX
 * (regra do projeto). Sem preço e sem promessa de resultado — a página
 * leva pra uma conversa/reunião via WhatsApp.
 *
 * Oferta em 3 portas: 1) Sites e Presença Web · 2) Tráfego Pago e
 * Aquisição · 3) Presença Digital. Automação, Dados e Noryos OS aparecem
 * como complementos, não como produtos principais.
 */

export const solucoesHero = {
  eyebrow: "Soluções Noryos",
  heading: "Estrutura digital para a sua empresa ser encontrada, gerar contato e fechar mais negócio.",
  sub: "A Noryos cria e reestrutura sites, organiza a presença digital e desenvolve estratégias de aquisição para ajudar empresas a serem encontradas, gerar contatos e transformar interesse em oportunidade comercial.",
  ctaPrimario: "Conversar sobre minha empresa",
  ctaSecundario: "Ver como podemos ajudar",
  microcopy: "Primeiro entendemos seu cenário. Depois recomendamos o que realmente faz sentido.",
};

/** §2 — situações reconhecíveis. Identificação, não lista pessimista. */
export const problemasReconheciveis: string[] = [
  "Minha empresa ainda não tem um site profissional.",
  "Tenho um site, mas ele está antigo ou não gera contatos.",
  "Dependo quase só de indicação.",
  "Quero anunciar no Google ou no Instagram, mas não sei por onde começar.",
  "As pessoas encontram minha empresa, mas não chegam até o WhatsApp ou o orçamento.",
  "Site, Google, Instagram e WhatsApp parecem coisas separadas.",
  "Já anuncio, mas não tenho clareza do que está funcionando.",
  "Meu negócio é bom presencialmente, mas minha presença digital não transmite isso.",
];

export const problemasFecho =
  "Se algum desses cenários parece familiar, provavelmente existe uma prioridade clara para organizar primeiro.";
export const problemasCta = "Quero entender minha prioridade";

/** §3 — as 3 portas comerciais principais. */
export type PortaComercial = {
  slug: string;
  tag: string;
  titulo: string;
  ancora: string;
  descricao: string;
  problemas: string[];
  /** Mini-fluxo de 3 passos ilustrado no card (estático). */
  mini: [string, string, string];
  nota?: string;
  whatsapp: WhatsappPreset;
  ctaLabel: string;
  icon: IconName;
  href?: string;
  hrefLabel?: string;
};

export const portasComerciais: PortaComercial[] = [
  {
    slug: "sites",
    tag: "Base de tudo",
    titulo: "Sites e Presença Web",
    ancora: "Seu site precisa fazer mais do que existir.",
    descricao:
      "Uma estrutura digital que apresenta bem a empresa e conduz o visitante até uma ação — não um cartão de visita online. Site institucional, landing page ou reestruturação do que já existe, com experiência mobile de verdade, informação clara e caminho direto até o contato.",
    problemas: [
      "Não tem site profissional",
      "Site antigo ou lento",
      "Experiência ruim no celular",
      "Informações confusas",
      "Nenhum caminho claro para contato, orçamento ou agendamento",
      "O site não representa a qualidade real da empresa",
    ],
    mini: ["Visita", "Página clara", "Contato"],
    whatsapp: "site",
    ctaLabel: "Quero melhorar meu site",
    icon: "presenca",
    href: "/solucoes/sites",
    hrefLabel: "Ver a solução de Sites",
  },
  {
    slug: "trafego",
    tag: "Crescimento com acompanhamento",
    titulo: "Tráfego Pago e Aquisição",
    ancora: "Colocar sua empresa diante de quem tem potencial de virar cliente.",
    descricao:
      "Estrutura para atrair contatos com potencial comercial em Google Ads e Meta Ads — com rastreamento configurado desde o começo, otimização com dado real e relatórios que viram decisão. Não é impulsionar post e torcer.",
    problemas: [
      "Depende quase só de indicação",
      "Pouca demanda chegando",
      "Já investe em anúncio, mas sem acompanhamento",
      "Não sabe qual canal usar",
      "O anúncio leva para uma página ruim",
      "Recebe clique, mas não recebe contato",
      "Não consegue entender o que está funcionando",
    ],
    mini: ["Anúncio", "Página certa", "Oportunidade"],
    nota: "Resultado depende de mercado, oferta, investimento, atendimento e outros fatores. Não prometemos faturamento.",
    whatsapp: "trafego",
    ctaLabel: "Quero gerar mais oportunidades",
    icon: "aquisicao",
    href: "/solucoes/performance",
    hrefLabel: "Ver a solução de Aquisição",
  },
  {
    slug: "presenca",
    tag: "Como te encontram e te avaliam",
    titulo: "Presença Digital",
    ancora: "Quando alguém procura sua empresa, o que encontra precisa transmitir confiança.",
    descricao:
      "Organização dos principais pontos onde o cliente encontra e avalia o seu negócio: Perfil da Empresa no Google, site, WhatsApp, canais e informações — tudo coerente e apontando para o mesmo lugar. Inclui consistência de comunicação, conteúdo essencial das páginas e o direcionamento do visitante entre os canais.",
    problemas: [
      "Informação diferente em cada canal",
      "Presença abandonada ou desatualizada",
      "Perfil do Google mal configurado",
      "Empresa difícil de encontrar",
      "Canais sem coerência entre si",
      "A comunicação não representa bem o negócio",
    ],
    mini: ["Busca", "Informação coerente", "Confiança"],
    whatsapp: "presenca",
    ctaLabel: "Quero organizar minha presença digital",
    icon: "node",
  },
];

/** §4 — complementos. Não são três novos produtos principais. */
export const complementosIntro =
  "Nem toda empresa precisa começar por tudo. Esses recursos entram quando ajudam a resolver uma necessidade real da operação.";

export type Complemento = {
  titulo: string;
  descricao: string;
  icon: IconName;
  href?: string;
  hrefLabel?: string;
  whatsapp?: WhatsappPreset;
};

export const complementos: Complemento[] = [
  {
    titulo: "Automação e Integrações",
    descricao:
      "WhatsApp, CRM, follow-up e integrações para organizar o atendimento e tirar da memória o que hoje depende de alguém lembrar de fazer.",
    icon: "automacao",
    href: "/solucoes/automacoes",
    hrefLabel: "Ver a solução de Automação",
    whatsapp: "automacao",
  },
  {
    titulo: "Dados e Acompanhamento",
    descricao:
      "Métricas, conversões e indicadores acompanhados de perto, para priorizar com base no que realmente move o negócio.",
    icon: "dados",
    whatsapp: "geral",
  },
  {
    titulo: "Noryos OS",
    descricao:
      "A metodologia que mantém o projeto organizado, documentado e com continuidade depois da entrega.",
    icon: "spark",
    href: "/#noryos-os",
    hrefLabel: "Conhecer o Noryos OS",
  },
];

/** §5 — cenários por segmento. Aplicação, não case. */
export const segmentosIntro = "Aplicamos a estrutura ao contexto do seu negócio.";
export const segmentosRotulo =
  "Cenários de aplicação para ilustrar o método — não são cases nem resultados obtidos.";

export type Segmento = {
  id: string;
  titulo: string;
  fluxo: string[];
  problemas: string[];
};

export const segmentos: Segmento[] = [
  {
    id: "odonto",
    titulo: "Clínicas odontológicas",
    fluxo: ["Google", "Página do tratamento", "WhatsApp / agendamento", "Acompanhamento"],
    problemas: [
      "Tratamentos pouco encontrados na busca",
      "Site genérico, igual ao de todo mundo",
      "Campanha sem página de destino adequada",
      "Contato que se perde antes de agendar",
    ],
  },
  {
    id: "estetica",
    titulo: "Clínicas de estética",
    fluxo: ["Meta / Google", "Página do procedimento", "WhatsApp", "Avaliação / agendamento"],
    problemas: [
      "Presença forte nas redes, sem estrutura de conversão",
      "Campanhas sem organização",
      "Dependência do direct para fechar",
    ],
  },
  {
    id: "automotivo",
    titulo: "Loja, oficina, autopeças e motopeças",
    fluxo: ["Busca local", "Google / Site", "WhatsApp", "Orçamento"],
    problemas: [
      "A pessoa procura e não encontra",
      "Horário, endereço e serviços confusos",
      "Dependência de indicação",
      "Presença local fraca",
    ],
  },
  {
    id: "local",
    titulo: "Comércio e serviços locais",
    fluxo: ["Pesquisa / interesse", "Presença digital", "Contato", "Oportunidade"],
    problemas: [
      "Quem procura não chega até a empresa",
      "Presença que não passa a real qualidade do negócio",
      "Sem caminho claro para o contato",
    ],
  },
];

/** §6 — você não precisa contratar tudo. */
export const inicioIntro = "Começamos pelo que faz mais diferença agora.";
export const inicioTexto =
  "Uma empresa pode precisar primeiro de um site. Outra já tem uma boa estrutura e precisa gerar demanda. Outra precisa organizar a presença antes de anunciar. A reunião inicial serve justamente para identificar essa prioridade.";
export const inicioCta = "Descobrir por onde começar";

export const cenariosInicio: { rotulo: string; nome: string; descricao: string }[] = [
  { rotulo: "A", nome: "Site", descricao: "A prioridade é ter uma base digital que funciona." },
  { rotulo: "B", nome: "Site + Aquisição", descricao: "Base nova e campanhas para gerar demanda." },
  { rotulo: "C", nome: "Presença + Aquisição", descricao: "Organizar a presença antes de escalar investimento." },
  { rotulo: "D", nome: "Estrutura completa", descricao: "Presença, aquisição e automação na mesma operação." },
];

/** §7 — como é a primeira conversa. */
export const primeiraConversa: string[] = [
  "Entendemos seu negócio",
  "Identificamos o principal gargalo",
  "Avaliamos a estrutura atual",
  "Recomendamos o primeiro passo",
  "Só então estruturamos uma proposta",
];
export const primeiraConversaNota = "Sem compromisso de contratar na primeira conversa.";
export const primeiraConversaCta = "Agendar uma conversa pelo WhatsApp";

/** §8 — o que esperar da Noryos. */
export const compromissos: string[] = [
  "Escopo claro",
  "Prazo definido",
  "Comunicação objetiva",
  "Estrutura documentada",
  "Decisões explicadas",
  "Acompanhamento",
  "Evolução por prioridade",
  "Sem promessas irreais",
];

/** §9 — FAQ comercial específico da página. */
export const faqSolucoes: FaqItem[] = [
  {
    pergunta: "Já tenho site. Vocês conseguem melhorar o que existe?",
    resposta:
      "Na maioria das vezes, sim. Nem sempre é refazer do zero — muitas vezes o que resolve é corrigir estrutura, velocidade, conteúdo e o caminho até o contato. A gente avalia o que está de pé antes de sugerir reconstrução.",
  },
  {
    pergunta: "Preciso contratar site e tráfego juntos?",
    resposta:
      "Não. Cada frente pode entrar sozinha. A primeira conversa serve para identificar por onde faz mais sentido começar — às vezes é só o site, às vezes é aquisição, às vezes é organizar a presença antes de anunciar.",
  },
  {
    pergunta: "Vocês trabalham com Google Ads e Meta Ads?",
    resposta:
      "Sim, os dois. A escolha do canal e do formato vem depois de entender o objetivo, a oferta e a estrutura de conversão que já existe.",
  },
  {
    pergunta: "A verba dos anúncios está incluída?",
    resposta:
      "Não. O investimento em mídia é pago por você diretamente às plataformas (Google e Meta). A Noryos cuida da estratégia, da estruturação das campanhas, do acompanhamento e da otimização.",
  },
  {
    pergunta: "Vocês atendem pequenas empresas?",
    resposta:
      "Sim. Comércio local, prestadores de serviço e pequenas e médias empresas são o público principal nesta fase.",
  },
  {
    pergunta: "Vocês atendem clínicas?",
    resposta:
      "Sim — clínicas odontológicas e de estética estão entre os tipos de negócio que a estrutura atende. Trabalhamos a presença e a aquisição; não fazemos promessa de resultado clínico.",
  },
  {
    pergunta: "Vocês trabalham com comércio local?",
    resposta:
      "Sim. Loja, oficina, autopeças, motopeças e serviços locais fazem parte do foco: ser encontrado na busca local, ter informação consistente no Google e um caminho direto até o WhatsApp ou o orçamento.",
  },
  {
    pergunta: "Quanto custa?",
    resposta:
      "Depende do ponto de partida, do escopo e da prioridade. Por isso primeiro entendemos o cenário da empresa e depois apresentamos uma proposta adequada ao que realmente precisa ser feito.",
  },
  {
    pergunta: "Existe acompanhamento depois da entrega?",
    resposta:
      "Sim. Cada projeto é documentado para ter continuidade, e acompanhamento e evolução por prioridade fazem parte da forma como a Noryos trabalha.",
  },
  {
    pergunta: "Como funciona a primeira reunião?",
    resposta:
      "É uma conversa para entender seu negócio, identificar o principal gargalo e avaliar a estrutura atual. A partir daí recomendamos o primeiro passo. Sem compromisso de contratar na primeira conversa.",
  },
  {
    pergunta: "Vocês atendem empresas fora de Brasília?",
    resposta:
      "Sim. O atendimento é remoto, para empresas em todo o Brasil. A Noryos fica em Brasília e conhece de perto a realidade do comércio e dos serviços locais.",
  },
  {
    pergunta: "Preciso já ter fotos e textos prontos?",
    resposta:
      "Não. Ajudamos a organizar as informações essenciais e a estrutura de conteúdo das páginas. Se você já tiver material, aproveitamos; se não tiver, orientamos o que é necessário.",
  },
];

/** §10 — CTA final. */
export const solucoesCtaFinal = {
  eyebrow: "Próximo passo",
  heading: "Vamos entender o que pode fazer mais diferença no seu negócio agora?",
  texto:
    "Conte rapidamente como sua empresa funciona e o que você quer melhorar. A primeira conversa serve para entender o cenário e avaliar como a Noryos pode ajudar.",
  ctaPrimario: "Conversar com a Noryos no WhatsApp",
  ctaSecundario: "Fazer Diagnóstico Digital",
};
