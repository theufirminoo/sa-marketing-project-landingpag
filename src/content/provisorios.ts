/**
 * Valores provisórios definidos pelo cliente para a fase de testes.
 *
 * Cada valor daqui é trocado num lugar só. Quando o último for trocado,
 * `temProvisorios` fica falso e a página deixa de ter noindex.
 * `pnpm check:pendencias` lê esta lista.
 */

export const WHATSAPP_PROVISORIO = "5500000000000";
/** WhatsApp comercial da SA, (38) 99893-4902, confirmado pelo cliente. */
export const WHATSAPP_SA = "5538998934902";
const CNPJ_PROVISORIO = "00.000.000/0001-00";

/** Número no formato internacional, só dígitos: 55 + DDD + número. */
export const whatsappNumero: string =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || WHATSAPP_SA;

/** Dados da Receita (MEI, ativa desde 15/09/2026, Montes Claros/MG). */
export const empresa = {
  razaoSocial: "69.129.603 Samuel Cezar Nery Ribeiro",
  cnpj: "69.129.603/0001-94",
};

/**
 * Logo extraída do portfólio da SA (PDF do Canva), em imagem. Continua
 * provisória até chegar o SVG: troque por "/logo-sa.svg" quando chegar.
 */
export const logoSvg: string | undefined = "/logo-sa.webp";
/** Versão completa (SA + Marketing & Business + assinatura), usada no rodapé. */
export const logoCompleta = "/logo-sa-completo.webp";

/**
 * Fotos quadradas em public/socios/. Sem foto, o componente mostra a silhueta.
 * As três são fotos reais, recortadas sobre o mesmo fundo neutro, 800 x 800.
 */
export const fotosSocios: Record<"samuel" | "malaquias" | "matheus", string | undefined> = {
  samuel: "/socios/samuel.webp",
  malaquias: "/socios/malaquias.webp",
  matheus: "/socios/matheus.webp",
};

/** Vídeo de fundo do hero (mp4 + webm). O provisório tem "provisorio" no nome. */
export const videoHero = {
  src: "/video/fundo/criador-provisorio.mp4",
};

/**
 * Prova social de exemplo (fictícia), para ver o bloco montado.
 * true: mostra os exemplos enquanto não houver prova real em site.ts.
 * false: standby, a seção some até entrar prova real.
 */
export const provasExemplo = true;

/** Passa a falso quando o texto revisado da política entrar em /privacidade. */
export const politicaProvisoria = true;

export type ItemProvisorio = {
  id: string;
  item: string;
  valorAtual: string;
  trocaPor: string;
  ativo: boolean;
};

export const provisorios: ItemProvisorio[] = [
  {
    id: "whatsapp",
    item: "WhatsApp",
    valorAtual: whatsappNumero,
    trocaPor: "Número real da SA (NEXT_PUBLIC_WHATSAPP_NUMBER)",
    ativo: whatsappNumero === WHATSAPP_PROVISORIO,
  },
  {
    id: "cnpj",
    item: "CNPJ",
    valorAtual: empresa.cnpj,
    trocaPor: "CNPJ e razão social reais",
    ativo: (empresa.cnpj as string) === CNPJ_PROVISORIO,
  },
  {
    id: "logo",
    item: "Logo",
    valorAtual: logoSvg ?? 'Nome "SA Marketing" em texto',
    trocaPor: "public/logo-sa.svg (vetor)",
    ativo: !logoSvg?.endsWith(".svg"),
  },
  {
    id: "fotos",
    item: "Fotos dos sócios",
    valorAtual: "Fotos reais dos três sócios",
    trocaPor: "Três fotos dos sócios",
    ativo: Object.values(fotosSocios).some((foto) => foto === undefined || foto.includes("provisorio")),
  },
  {
    id: "video",
    item: "Vídeo do hero",
    valorAtual: videoHero.src,
    trocaPor: "Vídeo vertical da SA",
    ativo: videoHero.src.includes("provisorio"),
  },
  {
    id: "politica",
    item: "Política de privacidade",
    valorAtual: "Texto provisório curto",
    trocaPor: "Texto revisado",
    ativo: politicaProvisoria,
  },
  {
    id: "provas",
    item: "Prova social de exemplo",
    valorAtual: "Depoimentos, números e cases fictícios",
    trocaPor: "Prova real em provaSocial (site.ts) ou provasExemplo = false",
    ativo: provasExemplo,
  },
];

export const temProvisorios: boolean = provisorios.some((p) => p.ativo);

/** Etiqueta "Provisório" só aparece em desenvolvimento. */
export const mostrarEtiquetaProvisorio: boolean = process.env.NODE_ENV === "development";
