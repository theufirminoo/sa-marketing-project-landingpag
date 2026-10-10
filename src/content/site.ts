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
import type { Faturamento, Fase, FrenteId, Trava } from "./opcoes";

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
  { id: "ate-20", rotulo: "Até R$ 20 mil" },
  { id: "20-50", rotulo: "De R$ 20 mil a R$ 50 mil" },
  { id: "50-200", rotulo: "De R$ 50 mil a R$ 200 mil" },
  { id: "acima-200", rotulo: "Acima de R$ 200 mil" },
  { id: "nao-informado", rotulo: "Prefiro não informar" },
];

/* ------------------------------------------------------------------ */
/* Empresa e metadados                                                 */
/* ------------------------------------------------------------------ */

export const site = {
  nome: "SA Marketing",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://samarketing.co.br",
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
  mensagemWhatsappDireta: "Oi, vim pelo site da SA e quero conversar.",
  whatsappFlutuante: "Conversar com a SA no WhatsApp (abre em nova aba)",
  /** Mensagem do link que substitui uma opção quando não há JavaScript. */
  mensagemWhatsappSemJs: (trava: string) =>
    `Oi, vim pelo site da SA e quero conversar.\nTrava: ${trava}`,
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
  passo: "Responda aqui. Pergunta 1 de 3",
  pergunta: "O que mais trava suas vendas hoje?",
  dica: "Escolha a resposta que mais parece com você para começar.",
} as const;

/* ------------------------------------------------------------------ */
/* Carrossel do hero: o primeiro slide é a pergunta do diagnóstico      */
/* ------------------------------------------------------------------ */

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
  painel?: { titulo: string; itens: readonly { cabeca?: string; texto: string }[]; numerado?: boolean };
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
          { texto: "Sites, landing pages e lojas virtuais" },
          { texto: "Automação de WhatsApp e Instagram" },
          { texto: "Atendimento com IA que responde e qualifica" },
          { texto: "CRM, ERP e painéis sob medida" },
          { texto: "Integrações entre as ferramentas que você já usa" },
          { texto: "Suporte e evolução todo mês" },
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
      imagem: { src: "/imagens/hero/estudio.webp", alt: "Bastidor de gravação em estúdio, com câmera e monitor em primeiro plano" },
      video: "/video/fundo/estudio.mp4",
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
      chamada: "SA Social",
      titulo: "Seguidor que não compra é sinal de funil quebrado.",
      texto: "Conteúdo e anúncio trabalhando juntos até o direct virar pedido.",
      acao: "Começar pela SA Social",
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
  frentes?: string;
  quemFaz?: string;
} = {
  // Provisórios do Mixkit (licença gratuita, uso comercial, sem atribuição).
  hero: videoHero.src,
  frentes: "/video/fundo/reuniao.mp4",
  quemFaz: "/video/fundo/equipe.mp4",
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
  titulo: "Marketing é simples: cinco etapas, nesta ordem.",
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
    nome: "SA Social",
    promessa: "Conteúdo e anúncios que levam o seguidor até a compra.",
    servicos: [
      "Tráfego pago na Meta e no Google",
      "Gestão de perfis e calendário editorial",
      "Roteiro e texto para Reels e carrosséis",
      "Design de posts",
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
      "Storymaker, com cobertura em tempo real",
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
  /** A frente que carrega aberta. */
  abertaAoCarregar: "consultoria" as FrenteId,
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

export const quemFaz = {
  titulo: "Quem cuida do seu negócio.",
  abertura: "A SA é um time pequeno. Você fala com quem faz o trabalho.",
  altFoto: (nome: string) => `Retrato de ${nome}`,
  altSilhueta: (nome: string) => `Silhueta provisória no lugar da foto de ${nome}`,
  pessoas: [
    {
      id: "samuel",
      nome: "Samuel",
      cargo: "Chief Executive Officer (CEO)",
      cargoPt: "Diretor executivo",
      foto: fotosSocios.samuel,
    },
    {
      id: "malaquias",
      nome: "Malaquias",
      cargo: "Chief Commercial Officer (CCO)",
      cargoPt: "Diretor comercial",
      foto: fotosSocios.malaquias,
    },
    {
      id: "matheus",
      nome: "Matheus",
      cargo: "Chief Technology Officer (CTO)",
      cargoPt: "Diretor de tecnologia",
      foto: fotosSocios.matheus,
    },
  ] satisfies Pessoa[],
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

/** Só entram com dado real, com nome, empresa e autorização. */
export type Case = { cliente: string; resumo: string; fonte: string };
export type Depoimento = { nome: string; empresa: string; texto: string; autorizadoEm: string };
export type Numero = { valor: string; descricao: string; fonte: string };

export const cases = { titulo: "Cases.", itens: [] as readonly Case[] };
export const depoimentos = { titulo: "Quem já trabalha com a SA.", itens: [] as readonly Depoimento[] };
export const numeros = { titulo: "Números da SA.", itens: [] as readonly Numero[] };

/* ------------------------------------------------------------------ */
/* 7. Dúvidas                                                          */
/* ------------------------------------------------------------------ */

export const duvidas = {
  titulo: "Dúvidas antes de começar.",
  itens: [
    {
      pergunta: "O que a SA Marketing faz?",
      resposta:
        "A SA descobre em qual etapa a sua venda trava e resolve esse ponto. São quatro frentes: SA Consultoria, SA Social, SA Studio e SA Tech.",
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
        "Depende das frentes e do tamanho do trabalho. Você recebe a proposta com escopo, prazo e valor depois do diagnóstico inicial.",
    },
    {
      pergunta: "Em quanto tempo vejo resultado?",
      resposta:
        "Depende da etapa que está travando. Anúncios costumam dar sinal nas primeiras semanas; conteúdo e posicionamento levam alguns meses. O plano traz o prazo esperado de cada frente.",
    },
    {
      pergunta: "Quem vai cuidar do meu negócio?",
      resposta:
        "Os três sócios: Samuel, Malaquias e Matheus. Não existe repasse para outra equipe.",
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
        "Usa só para falar com você sobre o diagnóstico. Os detalhes estão na política de privacidade.",
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
} as const;

/* ------------------------------------------------------------------ */
/* 9. Rodapé                                                           */
/* ------------------------------------------------------------------ */

export const rodape = {
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  empresa: `${empresa.razaoSocial}, CNPJ ${empresa.cnpj}`,
  politica: "Política de privacidade",
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
          exemplo: "(11) 91234-5678",
          erro: "Faltam dígitos. Informe o DDD e os 9 números, como (11) 91234-5678.",
        },
        empresa: { rotulo: "Empresa (opcional)" },
        instagram: { rotulo: "Instagram da empresa (opcional)", exemplo: "@suaempresa" },
        isca: { rotulo: "Não preencha este campo" },
      },
    },
    resultado: {
      anuncio: "Resultado do diagnóstico",
      titulo: (frentes: string) => `Pelo que você contou, o começo é pela ${frentes}.`,
      texto: "A SA já recebeu suas respostas. Abra a conversa para combinar o diagnóstico.",
      abrirWhatsapp: "Abrir conversa no WhatsApp",
      refazer: "Refazer o diagnóstico",
    },
  },
  /** Linhas da mensagem pré-preenchida do WhatsApp. */
  mensagem: {
    abertura: (nome: string, empresaNome?: string) =>
      `Oi, aqui é ${nome}${empresaNome ? `, da ${empresaNome}` : ""}. Fiz o diagnóstico no site da SA.`,
    trava: "Trava",
    fase: "Fase",
    faturamento: "Faturamento",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Aviso de cookies                                                    */
/* ------------------------------------------------------------------ */

export const avisoCookies = {
  rotulo: "Aviso de cookies",
  texto: "A SA só mede as visitas desta página se você aceitar.",
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
      ],
    },
    {
      titulo: "Para que servem",
      paragrafos: [
        "A SA usa esses dados para falar com você sobre o diagnóstico e para saber quais campanhas trazem visitas.",
        "As respostas ficam no sistema de atendimento da SA. Durante a sua visita, elas também ficam guardadas no seu navegador, para você retomar o diagnóstico de onde parou. Fechar a aba apaga essa cópia.",
      ],
    },
    {
      titulo: "Cookies de medição",
      paragrafos: [
        "A página só carrega ferramentas de medição se você clicar em Aceitar no aviso de cookies. Se clicar em Recusar, nada é carregado. A sua escolha fica salva no seu navegador.",
      ],
    },
    {
      titulo: "Como pedir a exclusão",
      paragrafos: [
        "Mande uma mensagem pelo WhatsApp da SA ou pelo Instagram @samarketing.business pedindo a exclusão dos seus dados. A SA apaga os dados do sistema de atendimento.",
      ],
    },
  ],
} as const;
