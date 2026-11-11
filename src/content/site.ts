/**
 * Todo o texto e os dados da página. Nenhuma string de interface fica dentro
 * de componente. Regras de copy no CLAUDE.md.
 */
import { empresa, fotosSocios, videoHero } from "./provisorios";

/* ------------------------------------------------------------------ */
/* Tipos e opções do diagnóstico                                       */
/* ------------------------------------------------------------------ */

export {
  FASES,
  FATURAMENTOS,
  FRENTES,
  ORIGENS,
  TRAVAS,
  type Faturamento,
  type Fase,
  type FrenteId,
  type OrigemDiagnostico,
  type Trava,
} from "./opcoes";
import type {
  Decisao,
  Desafio,
  Faturamento,
  Fase,
  FrenteId,
  Investimento,
  Marketing,
  OrigemCliente,
  Prazo,
  Segmento,
  Trava,
} from "./opcoes";

export type Opcao<T extends string> = { id: T; rotulo: string };

export const travas: readonly (Opcao<Trava> & { frentes: readonly FrenteId[] })[] = [
  { id: "seguidores-nao-vendem", rotulo: "Tenho seguidores, mas não vendo", frentes: ["consultoria", "social"] },
  { id: "nao-vende-todo-dia", rotulo: "Não consigo vender todos os dias", frentes: ["consultoria", "social"] },
  { id: "depende-de-indicacao", rotulo: "Dependo só de indicação", frentes: ["social", "studio"] },
  { id: "processos-manuais", rotulo: "Meus processos são manuais", frentes: ["tech"] },
  { id: "nao-sabe-por-onde-comecar", rotulo: "Não sei por onde começar", frentes: ["consultoria"] },
];

export const fases: readonly Opcao<Fase>[] = [
  { id: "comecando", rotulo: "Começando agora" },
  { id: "constancia", rotulo: "Já vendo e quero constância" },
  { id: "escalar", rotulo: "Quero escalar" },
];

export const faturamentos: readonly Opcao<Faturamento>[] = [
  { id: "ate-10", rotulo: "Até R$ 10 mil" },
  { id: "10-20", rotulo: "De R$ 10 mil a R$ 20 mil" },
  { id: "20-50", rotulo: "De R$ 20 mil a R$ 50 mil" },
  { id: "50-200", rotulo: "De R$ 50 mil a R$ 200 mil" },
  { id: "acima-200", rotulo: "Acima de R$ 200 mil" },
];

/* ------------------------------------------------------------------ */
/* Empresa e metadados                                                 */
/* ------------------------------------------------------------------ */

export const site = {
  nome: "SA Marketing",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://saagencia.com.br",
  idioma: "pt-BR",
  instagram: {
    usuario: "@samarketing.business",
    url: "https://www.instagram.com/samarketing.business/",
  },
  desenvolvedor: { nome: "M9 Studio Tech", url: "https://www.m9studiotech.com.br" },
  empresa,
} as const;

export const metadados = {
  titulo: "SA Marketing: descubra onde o seu marketing para de vender",
  descricao:
    "Consultoria, social media, audiovisual e tecnologia em um time só. Responda 3 perguntas e converse com a SA pelo WhatsApp.",
  ogAlt: "SA Marketing: descubra onde o seu marketing para de vender.",
} as const;

/* ------------------------------------------------------------------ */
/* Peças de interface comuns                                           */
/* ------------------------------------------------------------------ */

export const comum = {
  pularConteudo: "Pular para o conteúdo",
  ctaDiagnostico: "Fazer diagnóstico",
  microtexto: "3 perguntas, 1 minuto. O diagnóstico inicial é cortesia.",
  etiquetaProvisorio: "Provisório",
  navPrincipal: "Seções da página",
  navRodape: "Seções da página, no rodapé",
  inicio: "SA Marketing, início da página",
  novaAba: "(abre em nova aba)",
  // Mensagens do WhatsApp: são da pessoa para a SA, por isso levam emoji (pedido do cliente).
  mensagemWhatsappDireta: "Oi, tudo bem? 😊 Vim pelo site da SA e quero entender como vocês podem me ajudar a vender mais 🚀",
  whatsappFlutuante: "Conversar com a SA no WhatsApp (abre em nova aba)",
  /** Mensagem do link que substitui uma opção quando não há JavaScript. */
  mensagemWhatsappSemJs: (trava: string) =>
    `Oi, tudo bem? 😊 Vim pelo site da SA e quero entender como vocês podem me ajudar a vender mais 🚀\n\nHoje o que mais trava é: ${trava}`,
} as const;

export const ancoras = [
  { href: "#metodo", rotulo: "Método" },
  { href: "#frentes", rotulo: "Frentes" },
  { href: "#quem-faz", rotulo: "Quem faz" },
  { href: "#duvidas", rotulo: "Dúvidas" },
] as const;

/* ------------------------------------------------------------------ */
/* 1. Hero                                                             */
/* ------------------------------------------------------------------ */

export const hero = {
  /** Uma linha por item: cada uma entra com 60 ms de atraso. */
  titulo: ["Descubra onde", "o seu marketing", "para de vender."],
  subtitulo:
    "Responda 3 perguntas e converse com a SA pelo WhatsApp. Você sai sabendo qual etapa está falhando e o que fazer primeiro.",
  passo: "Primeira pergunta do diagnóstico",
  pergunta: "O que mais trava suas vendas hoje?",
  acao: "Responder agora",
} as const;

/* ------------------------------------------------------------------ */
/* Carrossel do hero: o primeiro slide é a pergunta do diagnóstico      */
/* ------------------------------------------------------------------ */

/** Ícones dos blocos do carrossel; o desenho de cada um fica em Hero.tsx. */
export type IconeSlide =
  | "site"
  | "whatsapp"
  | "ia"
  | "painel"
  | "integracao"
  | "suporte"
  | "reels"
  | "foto"
  | "videocast"
  | "depoimento";

export type SlideHero = {
  id: string;
  /** Cada slide tem um formato, para o hero não ficar repetitivo. */
  formato: "video" | "foto" | "painel";
  frente: FrenteId;
  chamada: string;
  titulo: string;
  texto: string;
  acao: string;
  imagem: { src: string; alt: string };
  video?: string;
  /** Formato "painel": cartão de vidro ao lado do texto. */
  /** Destaques curtos mostrados em blocos no slide (vídeo e foto). */
  destaques?: readonly { texto: string; icone?: IconeSlide; imagem?: string }[];
  painel?: { titulo: string; itens: readonly { cabeca?: string; texto: string; icone?: IconeSlide }[]; numerado?: boolean };
};

export const carrossel = {
  rotulo: "Destaques da SA",
  anterior: "Slide anterior",
  proximo: "Próximo slide",
  pausar: "Pausar a troca automática",
  tocar: "Retomar a troca automática",
  irPara: (n: number) => `Ir para o slide ${n}`,
  posicao: (n: number, total: number) => `Slide ${n} de ${total}`,
  slides: [
    {
      id: "tech",
      formato: "painel",
      frente: "tech",
      chamada: "SA Tech",
      titulo: "Seu WhatsApp atende, qualifica e agenda enquanto você vende.",
      texto: "A SA Tech constrói o site, a loja, o CRM e as automações do seu negócio, tudo ligado ao seu atendimento.",
      acao: "Começar pela SA Tech",
      imagem: { src: "/imagens/hero/tech.webp", alt: "Programador usa o celular ao lado de um teclado iluminado" },
      painel: {
        titulo: "O que a SA Tech constrói",
        itens: [
          { texto: "Sites, landing pages e lojas virtuais", icone: "site" },
          { texto: "Automação de WhatsApp e Instagram", icone: "whatsapp" },
          { texto: "Atendimento com IA que responde e qualifica", icone: "ia" },
          { texto: "CRM, ERP e painéis sob medida", icone: "painel" },
          { texto: "Integrações entre as ferramentas que você já usa", icone: "integracao" },
          { texto: "Suporte e evolução todo mês", icone: "suporte" },
        ],
      },
    },
    {
      id: "studio",
      formato: "video",
      frente: "studio",
      chamada: "SA Studio",
      titulo: "Reels, fotos e vídeo gravados pensando na venda.",
      texto: "Da pauta à edição, cada peça sai com um papel no seu funil.",
      acao: "Começar pela SA Studio",
      imagem: { src: "/imagens/hero/estudio.webp", alt: "Editora de vídeo de fone trabalhando na linha do tempo em dois monitores" },
      video: "/video/fundo/estudio.mp4",
      destaques: [
        { texto: "Reels toda semana", icone: "reels" },
        { texto: "Foto de produto e equipe", icone: "foto" },
        { texto: "Videocast e cortes", icone: "videocast" },
        { texto: "Depoimento de cliente em vídeo", icone: "depoimento" },
      ],
    },
    {
      id: "consultoria",
      formato: "painel",
      frente: "consultoria",
      chamada: "SA Consultoria",
      titulo: "Antes de postar mais, descubra onde a venda trava.",
      texto: "A SA senta com você, abre números, oferta e atendimento, e sai com um plano do que fazer primeiro.",
      acao: "Começar pela SA Consultoria",
      imagem: { src: "/imagens/hero/consultoria.webp", alt: "Profissional apresenta uma estratégia no quadro branco para a equipe" },
      painel: {
        titulo: "Como a consultoria anda",
        numerado: true,
        itens: [
          { cabeca: "Diagnóstico", texto: "a gente mapeia do primeiro contato até a venda fechada." },
          { cabeca: "Plano", texto: "metas, oferta e rotina comercial definidas com você." },
          { cabeca: "Treino", texto: "equipe pronta para atender e vender do mesmo jeito." },
          { cabeca: "Acompanhamento", texto: "indicadores revistos todo mês, com ajuste de rota." },
        ],
      },
    },
    {
      id: "social",
      formato: "foto",
      frente: "social",
      chamada: "SA Digital",
      titulo: "Seguidor que não compra é sinal de funil quebrado.",
      texto: "Conteúdo e anúncio trabalhando juntos até o direct virar pedido.",
      acao: "Começar pela SA Digital",
      destaques: [
        { texto: "Conteúdo que atrai" },
        { texto: "Anúncio que alcança" },
        { texto: "Direct respondido" },
        { texto: "Pedido fechado" },
      ],
      imagem: { src: "/imagens/hero/social.webp", alt: "Pessoa rolando uma rede social no celular ao lado do notebook" },
    },
  ] satisfies SlideHero[],
};

/* ------------------------------------------------------------------ */
/* Movimento: vídeos de fundo e faixa das etapas                        */
/* ------------------------------------------------------------------ */

/**
 * Vídeos reais de fundo (bastidor, gravação, atendimento, cliente). Coloque
 * os arquivos em public/video/fundo/ (mp4 e webm com o mesmo nome, sem
 * áudio, até 2,5 MB) e preencha o caminho do .mp4. Vazio: a seção fica sem
 * vídeo e mostra só o fundo da marca.
 */
export const fundos: {
  hero?: string;
} = {
  // Provisórios do Mixkit (licença gratuita, uso comercial, sem atribuição).
  hero: videoHero.src,
};

/* ------------------------------------------------------------------ */
/* 2. Método                                                           */
/* ------------------------------------------------------------------ */

export type Etapa = {
  id: string;
  nome: string;
  acontece: string;
  falha: string;
  frentes: readonly FrenteId[];
};

export const metodo = {
  titulo: "Vender é simples: cinco etapas, nesta ordem.",
  abertura:
    "Quando a venda não acontece, uma destas etapas está falhando. O diagnóstico mostra qual.",
  rotuloFalha: "Quando falha:",
  rotuloFrentes: "Frentes que cuidam desta etapa",
  etapas: [
    {
      id: "atrai",
      nome: "Atrai",
      acontece: "Gente nova descobre a sua marca.",
      falha: "Poucas visualizações e quase nenhum seguidor novo.",
      frentes: ["social", "studio"],
    },
    {
      id: "educa",
      nome: "Educa",
      acontece: "A pessoa entende o que você vende e por que confiar.",
      falha: "Seguem o perfil, mas ninguém pergunta o preço.",
      frentes: ["social", "studio"],
    },
    {
      id: "qualifica",
      nome: "Qualifica",
      acontece: "Você separa quem está pronto para comprar de quem só está olhando.",
      falha: "Muita conversa no direct e pouca proposta enviada.",
      frentes: ["consultoria", "tech"],
    },
    {
      id: "converte",
      nome: "Converte",
      acontece: "A conversa vira venda.",
      falha: "Você manda o orçamento e a pessoa some.",
      frentes: ["consultoria", "tech"],
    },
    {
      id: "fideliza",
      nome: "Fideliza",
      acontece: "O cliente volta e indica.",
      falha: "Todo mês começa do zero.",
      frentes: ["tech", "social"],
    },
  ] satisfies Etapa[],
} as const;

/* ------------------------------------------------------------------ */
/* 3. Frentes                                                          */
/* ------------------------------------------------------------------ */

export type Frente = {
  id: FrenteId;
  /** Foto 16:9 em public/imagens/frentes/. Provisória, do Mixkit. */
  imagem: { src: string; alt: string };
  nome: string;
  promessa: string;
  servicos: readonly string[];
};

export const frentes: readonly Frente[] = [
  {
    id: "consultoria",
    imagem: { src: "/imagens/frentes/consultoria.webp", alt: "Profissional explica a estratégia de marketing num quadro branco para a equipe" },
    nome: "SA Consultoria",
    promessa: "Descobre onde a venda trava e monta o plano.",
    servicos: [
      "Diagnóstico de negócio",
      "Análise de mercado e concorrência",
      "Planejamento estratégico e metas",
      "Estruturação comercial",
      "Posicionamento e oferta",
      "Treinamento de vendas e atendimento",
      "Acompanhamento mensal de indicadores",
    ],
  },
  {
    id: "social",
    imagem: { src: "/imagens/frentes/social.webp", alt: "Mãos rolando uma rede social no celular, ao lado de um notebook" },
    nome: "SA Digital",
    promessa: "Conteúdo e anúncios que levam o seguidor até a compra.",
    servicos: [
      "Tráfego pago na Meta e no Google",
      "Gestão de perfis e calendário editorial",
      "Roteiro e texto para Reels e carrosséis",
      "Design de posts",
      "Criação de logomarca",
      "Atendimento de directs e comentários",
      "Perfil da Empresa no Google",
      "Parcerias com influenciadores e UGC",
      "Relatório mensal",
    ],
  },
  {
    id: "studio",
    imagem: { src: "/imagens/frentes/studio.webp", alt: "Cinegrafista filmando na rua com a câmera no ombro" },
    nome: "SA Studio",
    promessa: "Vídeo e foto que fazem a marca parecer do tamanho que ela quer ter.",
    servicos: [
      "Storymaker, com cobertura de eventos em tempo real",
      "Videomaker, com pacote recorrente de Reels",
      "Filmmaker, para vídeo institucional e comercial",
      "Fotografia de produto, equipe e espaço",
      "Captação com drone",
      "Videocast e cortes",
      "Depoimentos de clientes em vídeo",
    ],
  },
  {
    id: "tech",
    imagem: { src: "/imagens/frentes/tech.webp", alt: "Mãos digitando em notebook e celular sobre relatórios" },
    nome: "SA Tech",
    promessa: "Site, sistema e automação para vender e atender sem trabalho manual.",
    servicos: [
      "Sites e landing pages",
      "Lojas virtuais",
      "Sistemas sob medida: CRM, ERP e painéis",
      "Automações de WhatsApp e Instagram",
      "Atendimento com IA",
      "Integrações e dashboards",
      "SEO para o site aparecer no Google",
      "Suporte e evolução mensal",
    ],
  },
];

export const nomeDaFrente = (id: FrenteId): string =>
  frentes.find((f) => f.id === id)?.nome ?? id;

export const secaoFrentes = {
  titulo: "Quatro frentes, um plano só.",
  abertura: "Cada frente cuida de uma parte do caminho até a venda. Entra primeiro a que resolve a sua trava.",
  rotuloServicos: (nome: string) => `O que a ${nome} faz`,
  acao: "Começar por esta frente",
  rotuloIndice: "As quatro frentes",
  /** Nome curto no indicador de progresso. */
  nomeCurto: (nome: string) => nome.replace(/^SA /, ""),
} as const;

/* ------------------------------------------------------------------ */
/* 4. Como começa                                                      */
/* ------------------------------------------------------------------ */

export const comoComeca = {
  titulo: "Como é começar com a SA.",
  passos: [
    {
      titulo: "Diagnóstico inicial.",
      texto:
        "Três perguntas aqui no site e uma conversa pelo WhatsApp, por cortesia da SA.",
    },
    {
      titulo: "Plano.",
      texto: "A SA mostra o que fazer primeiro, com escopo, prazo e valor.",
    },
    {
      titulo: "Execução.",
      texto: "As frentes que o plano pedir entram em campo, cada uma com um responsável.",
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* 5. Quem faz                                                         */
/* ------------------------------------------------------------------ */

export type Pessoa = {
  id: keyof typeof fotosSocios;
  nome: string;
  cargo: string;
  cargoPt: string;
  /** Caminho de uma foto 4:5 em public/. Sem ela, entra a silhueta. */
  foto?: string;
};

/** Parceiros: trabalham junto com a SA, mas não são sócios. */
export type Parceiro = {
  id: string;
  nome: string;
  funcao: string;
  /** Foto 4:5 em public/socios/. */
  foto: string;
};

export const quemFaz = {
  titulo: "Quem cuida do seu negócio.",
  abertura: "Marketing digital desde 2020, num time pequeno. Você fala com quem faz o trabalho.",
  altFoto: (nome: string) => `Retrato de ${nome}`,
  altSilhueta: (nome: string) => `Silhueta provisória no lugar da foto de ${nome}`,
  pessoas: [
    {
      id: "samuel",
      nome: "Samuel Cezar",
      cargo: "Chief Executive Officer (CEO)",
      cargoPt: "Gestor comercial",
      foto: fotosSocios.samuel,
    },
    {
      id: "malaquias",
      nome: "Malaquias",
      cargo: "Chief Marketing Officer (CMO)",
      cargoPt: "Gestor de tráfego",
      foto: fotosSocios.malaquias,
    },
    {
      id: "matheus",
      nome: "Matheus Firmino",
      cargo: "Chief Technology Officer (CTO)",
      cargoPt: "Gestor de tecnologia",
      foto: fotosSocios.matheus,
    },
  ] satisfies Pessoa[],
  rotuloSocios: "Sócios",
  rotuloParceiros: "Parceiros",
  aberturaParceiros: "Especialistas que gravam e cuidam das redes junto com a SA.",
  parceiros: [
    { id: "nayara", nome: "Nayara Kelly", funcao: "Filmmaker e storymaker", foto: "/socios/nayara.webp" },
    { id: "lunna", nome: "Lunna Rodrigues", funcao: "Social media", foto: "/socios/lunna.webp" },
  ] satisfies Parceiro[],
} as const;

/* ------------------------------------------------------------------ */
/* 6. O que a SA publica, e as seções que esperam dado real             */
/* ------------------------------------------------------------------ */

export type Reel = {
  /** URL do Reel no Instagram. */
  url: string;
  /** Pôster 9:16 em public/reels/. */
  poster: string;
  /** Descrição do que o pôster mostra. */
  alt: string;
  legenda: string;
};

export const publica = {
  titulo: "O que a SA publica.",
  abertura: "O mesmo raciocínio que a gente aplica para os clientes está no nosso perfil.",
  linkPerfil: "Ver o perfil no Instagram",
  rotuloReel: (legenda: string) => `Abrir no Instagram o Reel: ${legenda}`,
  /** Vazio até a SA escolher três Reels. Vazia, a seção não aparece. */
  reels: [] as readonly Reel[],
};

/**
 * Prova social. As listas abaixo são só para dado real (com fonte, nome,
 * empresa e autorização). Enquanto estiverem vazias, a seção usa os
 * exemplos de `src/content/provas-exemplo.ts`, se `provasExemplo` estiver
 * ligado em provisorios.ts; desligado, a seção some (standby).
 */
/** `logo`: caminho da logo do cliente em public/ (quadrada, fundo claro). Sem ela, entra uma marca de exemplo. */
export type Case = { cliente: string; segmento: string; antes: string; depois: string; fonte: string; logo?: string };
export type Depoimento = { nome: string; empresa: string; texto: string; autorizadoEm: string };
export type Numero = { valor: string; descricao: string; fonte: string };

export const provaSocial = {
  titulo: "Quem já vende com a SA.",
  abertura: "Resultado de quem passou pelo diagnóstico e seguiu com a gente.",
  rotuloNumeros: "Números da SA",
  rotuloDepoimentos: "Depoimentos de clientes",
  rotuloCases: "Cases",
  antes: "Antes",
  depois: "Depois",
  etiquetaExemplo: "Exemplo",
  cases: [] as readonly Case[],
  depoimentos: [] as readonly Depoimento[],
  numeros: [] as readonly Numero[],
};

/* ------------------------------------------------------------------ */
/* 7. Dúvidas                                                          */
/* ------------------------------------------------------------------ */

export const duvidas = {
  titulo: "Dúvidas antes de começar.",
  itens: [
    {
      pergunta: "O que a SA faz?",
      resposta:
        "A SA descobre em qual etapa a sua venda trava e resolve esse ponto. São quatro frentes: SA Consultoria, SA Digital, SA Studio e SA Tech.",
    },
    {
      pergunta: "Preciso contratar todas as frentes?",
      resposta:
        "Não. Você começa só pela frente que resolve a sua trava e soma outra quando fizer sentido.",
    },
    {
      pergunta: "Como funciona o diagnóstico inicial?",
      resposta:
        "As suas respostas chegam junto com a mensagem no WhatsApp. A conversa começa do ponto em que você parou, sem custo.",
    },
    {
      pergunta: "Quanto custa trabalhar com a SA?",
      resposta:
        "Cada projeto tem preço próprio, porque depende das frentes e do tamanho do trabalho. Você recebe a proposta com escopo, prazo e valor depois do diagnóstico inicial.",
    },
    {
      pergunta: "Em quanto tempo vejo resultado?",
      resposta:
        "Os projetos têm no mínimo 6 meses, o tempo de montar a base, medir e ajustar. Anúncios costumam dar sinal nas primeiras semanas; conteúdo e posicionamento levam alguns meses. Você acompanha tudo por relatório com os números da sua empresa.",
    },
    {
      pergunta: "Quem vai cuidar do meu negócio?",
      resposta:
        "Os três sócios, Samuel, Malaquias e Matheus, com a Nayara na gravação e a Lunna nas redes sociais. Ninguém repassa o seu projeto para outra equipe.",
    },
    {
      pergunta: "Para que tipo de negócio a SA trabalha?",
      resposta:
        "Para negócios de qualquer segmento que querem vender com mais constância, de quem está começando a quem já tem equipe e quer organizar o processo.",
    },
    {
      pergunta: "Já tenho quem cuide das minhas redes ou do meu site. Faz sentido conversar?",
      resposta:
        "Sim. O diagnóstico olha o caminho inteiro da venda. A SA entra só na etapa que está falhando e trabalha junto com o que já funciona.",
    },
    {
      pergunta: "A SA cria sites, sistemas e automações?",
      resposta:
        "Sim, pela SA Tech: sites e landing pages, lojas virtuais, sistemas sob medida como CRM e ERP, automações de WhatsApp e Instagram e atendimento com IA.",
    },
    {
      pergunta: "A SA grava vídeos e faz fotos?",
      resposta:
        "Sim, pela SA Studio: cobertura em tempo real, pacotes de Reels, vídeo institucional, fotografia, drone e videocast.",
    },
    {
      pergunta: "O que a SA faz com os dados que eu informo aqui?",
      resposta:
        "Usamos apenas para uma análise técnica da sua empresa e só para uso profissional, sempre preservando seus dados. Os detalhes estão na política de privacidade.",
      link: { texto: "política de privacidade", href: "/privacidade" },
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* 8. CTA final                                                        */
/* ------------------------------------------------------------------ */

export const ctaFinal = {
  titulo: "Chegou até aqui. Falta só descobrir a sua trava.",
  texto: "Leva um minuto e a conversa com a SA já começa com as suas respostas.",
  linkDireto: "Prefere falar direto?",
  rotuloBeneficios: "O que você leva do diagnóstico",
  beneficios: [
    { titulo: "Descobrir a trava do seu negócio", texto: "Você sai sabendo se o problema está em atrair, educar, qualificar, converter ou fidelizar." },
    { titulo: "Por onde começar", texto: "A frente certa para o seu momento, sem contratar o que você não precisa." },
    { titulo: "Conversa já adiantada", texto: "Suas respostas chegam escritas no WhatsApp da SA. Você não repete a história." },
  ],
  garantias: ["Diagnóstico inicial é cortesia", "Sem contrato para conversar", "3 perguntas, 1 minuto"],
} as const;

/* ------------------------------------------------------------------ */
/* 9. Rodapé                                                           */
/* ------------------------------------------------------------------ */

export const rodape = {
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  empresa: `SA Marketing & Business, CNPJ ${empresa.cnpj}`,
  politica: "Política de privacidade",
  preferencias: "Preferências de cookies",
  direitos: (ano: string) => `© ${ano} SA Marketing`,
  desenvolvidoPor: "Desenvolvido por",
} as const;

/* ------------------------------------------------------------------ */
/* Diagnóstico                                                         */
/* ------------------------------------------------------------------ */

export const diagnostico = {
  fechar: "Fechar o diagnóstico",
  voltar: "Voltar",
  continuar: "Continuar",
  totalEtapas: 4,
  contador: (etapa: number) => `Etapa ${etapa} de 4`,
  progresso: "Progresso do diagnóstico",
  telas: {
    trava: { pergunta: "O que mais trava suas vendas hoje?" },
    fase: { pergunta: "Em que fase está o negócio?" },
    faturamento: { pergunta: "Quanto o negócio fatura por mês?" },
    contato: {
      pergunta: "Para onde a SA manda a resposta?",
      enviar: "Ver meu resultado",
      enviando: "Enviando suas respostas…",
      consentimento: {
        antes: "Ao continuar, você concorda que a SA use esses dados para falar com você. Veja a ",
        link: "política de privacidade",
        depois: ".",
      },
      campos: {
        nome: {
          rotulo: "Nome",
          erro: "Informe seu nome para a SA saber com quem fala.",
        },
        whatsapp: {
          rotulo: "WhatsApp com DDD",
          exemplo: "(11) 98765-4321",
          erro: "Faltam dígitos. Informe o DDD e os 9 números, como (11) 98765-4321.",
        },
        empresa: { rotulo: "Empresa (opcional)" },
        instagram: { rotulo: "Instagram da empresa (opcional)", exemplo: "@suaempresa" },
        isca: { rotulo: "Não preencha este campo" },
      },
    },
    resultado: {
      anuncio: "Resultado do diagnóstico",
      rotulo: "Seu diagnóstico está pronto",
      titulo: (nome: string) => `${nome}, já sabemos por onde começar.`,
      rotuloFrentes: "Frentes indicadas para você",
      rotuloRespostas: "O que você contou",
      respostas: { trava: "O que mais trava", fase: "Momento", faturamento: "Faturamento" },
      texto: "Suas respostas já vão escritas na mensagem. É só enviar e a SA continua a conversa a partir daqui.",
      abrirWhatsapp: "Enviar no WhatsApp",
      refazer: "Refazer o diagnóstico",
    },
  },
  /** Linhas da mensagem pré-preenchida do WhatsApp. */
  mensagem: {
    abertura: (nome: string, empresaNome?: string) =>
      `Oi, tudo bem? 😊 Aqui é ${nome}${empresaNome ? `, da ${empresaNome}` : ""}.`,
    pedido: (frentes: string) =>
      `Fiz o diagnóstico pelo site e quero saber mais sobre como a SA pode me ajudar 🚀🙌\nO resultado indicou começar pela ${frentes}.`,
  },
} as const;

/* ------------------------------------------------------------------ */
/* Briefing antes da reunião (briefing.saagencia.com.br)               */
/* ------------------------------------------------------------------ */

/** Opções do briefing. As faixas de investimento são provisórias (ver PENDENCIAS). */
export const briefingOpcoes = {
  segmento: [
    { id: "servicos", rotulo: "Serviços" },
    { id: "comercio", rotulo: "Comércio e varejo" },
    { id: "saude-estetica", rotulo: "Saúde e estética" },
    { id: "alimentacao", rotulo: "Alimentação" },
    { id: "educacao", rotulo: "Educação" },
    { id: "industria", rotulo: "Indústria" },
    { id: "outro", rotulo: "Outro ramo" },
  ] satisfies Opcao<Segmento>[],
  faturamento: faturamentos,
  origem: [
    { id: "indicacao", rotulo: "Indicação" },
    { id: "redes-sociais", rotulo: "Instagram e outras redes" },
    { id: "google", rotulo: "Google" },
    { id: "anuncios", rotulo: "Anúncios pagos" },
    { id: "loja-fisica", rotulo: "Loja física ou passagem" },
    { id: "outro", rotulo: "Outro canal" },
  ] satisfies Opcao<OrigemCliente>[],
  // Cada desafio aponta para uma frente: dois da Consultoria, dois da
  // Digital, um do Studio e um da Tech.
  desafio: [
    { id: "sem-plano", rotulo: "Não tenho um plano claro para vender mais" }, // Consultoria
    { id: "converter", rotulo: "Muita conversa e pouca venda fechada" }, // Consultoria
    { id: "atrair-clientes", rotulo: "Atrair clientes novos todo mês" }, // Digital
    { id: "seguidores-nao-compram", rotulo: "Tenho seguidores, mas eles não compram" }, // Digital
    { id: "imagem-da-marca", rotulo: "Fotos e vídeos não mostram o nível da marca" }, // Studio
    { id: "processos-manuais", rotulo: "Atendimento e vendas no manual, sem sistema" }, // Tech
    { id: "outro", rotulo: "Outro desafio" },
  ] satisfies Opcao<Desafio>[],
  marketing: [
    { id: "ninguem", rotulo: "Ninguém cuida" },
    { id: "eu-mesmo", rotulo: "Eu mesmo, quando dá tempo" },
    { id: "agencia-ou-freela", rotulo: "Agência ou freelancer" },
    { id: "equipe-interna", rotulo: "Uma equipe interna" },
  ] satisfies Opcao<Marketing>[],
  decisao: [
    { id: "eu", rotulo: "Eu decido" },
    { id: "com-socio", rotulo: "Decido com sócio" },
    { id: "outra-pessoa", rotulo: "Outra pessoa decide" },
  ] satisfies Opcao<Decisao>[],
  prazo: [
    { id: "agora", rotulo: "Ainda este mês" },
    { id: "tres-meses", rotulo: "Nos próximos 3 meses" },
    { id: "pesquisando", rotulo: "Ainda estou pesquisando" },
  ] satisfies Opcao<Prazo>[],
  investimento: [
    { id: "ate-1500", rotulo: "Até R$ 1.500" },
    { id: "1500-3000", rotulo: "De R$ 1.500 a R$ 3.000" },
    { id: "3000-6000", rotulo: "De R$ 3.000 a R$ 6.000" },
    { id: "acima-6000", rotulo: "Acima de R$ 6.000" },
  ] satisfies Opcao<Investimento>[],
} as const;

export type PerguntaBriefing = keyof typeof briefingOpcoes;

export const briefing = {
  metadados: {
    titulo: "Briefing | SA Marketing & Business",
    descricao: "Oito perguntas rápidas antes da conversa com a SA.",
  },
  progresso: "Progresso do briefing",
  contador: (etapa: number, total: number) => `${etapa} de ${total}`,
  voltar: "Voltar",
  continuar: "Continuar",
  abertura: {
    rotulo: "Antes da conversa",
    titulo: "Conte um pouco do seu negócio.",
    texto: "São 8 perguntas rápidas e leva uns 2 minutos. Assim a SA chega na conversa já sabendo onde você está.",
    comecar: "Começar o briefing",
  },
  perguntas: {
    segmento: { pergunta: "Qual é o ramo do negócio?" },
    faturamento: { pergunta: "Quanto o negócio fatura por mês?" },
    origem: { pergunta: "De onde vem a maioria dos clientes hoje?" },
    desafio: { pergunta: "Qual é o maior desafio do negócio hoje?" },
    marketing: { pergunta: "Quem cuida do marketing hoje?" },
    decisao: { pergunta: "Quem decide sobre contratar a SA?" },
    prazo: { pergunta: "Quando você quer começar?" },
    investimento: {
      pergunta: "Quanto você pode investir por mês na SA?",
      ajuda: "Só o serviço. A verba de anúncios fica à parte.",
    },
  } satisfies Record<PerguntaBriefing, { pergunta: string; ajuda?: string }>,
  /** Campo que aparece quando a pessoa escolhe "Outro". */
  outro: {
    segmento: { rotulo: "Qual é o ramo?", exemplo: "Ex.: oficina mecânica" },
    origem: { rotulo: "De onde eles vêm?", exemplo: "Ex.: feiras e eventos" },
    desafio: { rotulo: "Qual é o desafio?", exemplo: "Ex.: precificar os serviços" },
    erro: "Escreva em poucas palavras para continuar.",
  },
  objetivo: {
    pergunta: "O que você quer ter conquistado daqui a 6 a 12 meses?",
    rotulo: "Uma ou duas frases bastam. Opcional.",
    exemplo: "Vender todo dia pelo Instagram e depender menos de indicação",
    pular: "Pular esta pergunta",
    erro: "Use até 500 caracteres.",
  },
  contato: {
    pergunta: "Quem está respondendo?",
    concluir: "Concluir o briefing",
    enviando: "Guardando suas respostas…",
  },
  concluido: {
    anuncio: "Briefing concluído",
    rotulo: "Briefing recebido",
    titulo: (nome: string) => `Obrigado, ${nome}. A SA recebeu tudo.`,
    texto: "Agora a SA estuda suas respostas e chama você no WhatsApp para marcar a conversa.",
    whatsapp: "Falar com a SA no WhatsApp",
  },
  falhou: {
    rotulo: "Falta um passo",
    titulo: (nome: string) => `${nome}, suas respostas não chegaram à SA.`,
    texto: "Mande pelo WhatsApp: as respostas já vão escritas na mensagem.",
    whatsapp: "Enviar no WhatsApp",
  },
  /** Mensagem do WhatsApp quando o briefing não foi gravado. É da pessoa para a SA. */
  mensagem: {
    abertura: (nome: string, empresaNome?: string) =>
      `Oi, tudo bem? 😊 Aqui é ${nome}${empresaNome ? `, da ${empresaNome}` : ""}. Respondi o briefing pelo site:`,
    rotulos: {
      segmento: "Ramo",
      faturamento: "Faturamento",
      origem: "Clientes vêm de",
      desafio: "Maior desafio",
      marketing: "Marketing",
      decisao: "Decisão",
      prazo: "Começar",
      investimento: "Investimento",
    } satisfies Record<PerguntaBriefing, string>,
    objetivo: "Objetivo",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Aviso de cookies                                                    */
/* ------------------------------------------------------------------ */

export const avisoCookies = {
  rotulo: "Aviso de cookies",
  texto:
    "Se você aceitar, a SA mede como a página é usada: de onde você veio, o aparelho, as seções vistas e os cliques. Sem guardar seu nome nem seu IP.",
  aceitar: "Aceitar",
  recusar: "Recusar",
  politica: "Política de privacidade",
} as const;

/* ------------------------------------------------------------------ */
/* Política de privacidade (provisória)                                */
/* ------------------------------------------------------------------ */

export const privacidade = {
  titulo: "Política de privacidade.",
  aviso:
    "Texto provisório. A versão revisada da SA vai substituir este texto antes do lançamento.",
  voltar: "Voltar para a página inicial",
  secoes: [
    {
      titulo: "O que o formulário coleta",
      paragrafos: [
        "No diagnóstico, o formulário pede seu nome e seu WhatsApp. Empresa e Instagram são opcionais.",
        "Junto vão as três respostas do diagnóstico, a página por onde você entrou, o site que trouxe você até aqui e os parâmetros de campanha do link, como utm_source, fbclid e gclid.",
        "No briefing antes da reunião, além do contato, vão as respostas sobre o negócio: ramo, faturamento, de onde vêm os clientes, quem cuida do marketing, quem decide, quando quer começar, quanto pode investir e, se você escrever, o seu objetivo.",
      ],
    },
    {
      titulo: "Para que servem",
      paragrafos: [
        "A SA usa esses dados para falar com você sobre o diagnóstico e para saber quais campanhas trazem visitas.",
        "As respostas ficam no banco de dados da SA, no Supabase, com servidores em São Paulo. Seu WhatsApp identifica o cadastro: se você responder de novo, a SA atualiza o que já tem em vez de criar outro. Com as respostas do briefing, a SA prepara a conversa e avalia como pode ajudar.",
        "Quando a SA usar um sistema de atendimento (CRM), o contato e as respostas do diagnóstico também seguem para ele. Só a equipe da SA acessa esses dados. Durante a sua visita, as respostas também ficam guardadas no seu navegador, para você retomar o diagnóstico ou o briefing de onde parou. Fechar a aba apaga essa cópia.",
      ],
    },
    {
      titulo: "Medição de visitas",
      paragrafos: [
        "A hospedagem do site (Vercel) conta as visitas de forma anônima, sem cookies e sem guardar seu endereço IP: só a página vista, o site de origem, o país e o tipo de aparelho. Qualquer outra medição só acontece se você clicar em Aceitar no aviso de cookies. Se clicar em Recusar, só a contagem anônima continua. A sua escolha fica salva no seu navegador e pode ser trocada a qualquer momento em Preferências de cookies, no rodapé.",
        "Com o aceite, a SA registra: a página e o horário da visita, o site e a campanha que trouxeram você (utm_source, utm_medium, utm_campaign e se o link tinha fbclid ou gclid), o idioma, o fuso horário, o tipo de aparelho, o sistema, o navegador, o tamanho da tela, a qualidade da conexão, o país, o estado e a cidade aproximados, as seções vistas e por quanto tempo, até onde você rolou, os botões clicados, as etapas do diagnóstico (sem nome, WhatsApp, empresa ou Instagram), o tempo de carregamento da página e erros técnicos.",
        "Para saber se é a primeira visita ou um retorno, o navegador guarda um código aleatório que não diz quem você é. O endereço IP não é guardado: vira um código que muda todo dia.",
        "Esses dados servem só para a SA entender quais campanhas e partes da página funcionam. Não são vendidos nem cedidos, ficam guardados por até 13 meses e são apagados depois. Recusar nas preferências apaga o código do seu navegador.",
      ],
    },
    {
      titulo: "Como pedir a exclusão",
      paragrafos: [
        "Mande uma mensagem pelo WhatsApp da SA ou pelo Instagram @samarketing.business pedindo a exclusão dos seus dados. A SA apaga seu cadastro e suas respostas do banco de dados.",
      ],
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Página não encontrada                                               */
/* ------------------------------------------------------------------ */

export const naoEncontrada = {
  titulo: "Esta página não existe.",
  texto: "O endereço pode ter mudado. A página principal tem tudo sobre a SA e o diagnóstico.",
  voltar: "Ir para a página inicial",
} as const;
