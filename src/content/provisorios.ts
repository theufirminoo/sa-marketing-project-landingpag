/**
 * Valores provisórios definidos pelo cliente para a fase de testes.
 *
 * Cada valor daqui é trocado num lugar só. Quando o último for trocado,
 * `temProvisorios` fica falso e a página deixa de ter noindex.
 * `pnpm check:pendencias` lê esta lista.
 */

export const WHATSAPP_PROVISORIO = "5500000000000";
const CNPJ_PROVISORIO = "00.000.000/0001-00";

/** Número no formato internacional, só dígitos: 55 + DDD + número. */
export const whatsappNumero: string =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || WHATSAPP_PROVISORIO;

export const empresa = {
  razaoSocial: "SA Marketing",
  cnpj: CNPJ_PROVISORIO,
};

/** Troque por "/logo-sa.svg" quando o arquivo chegar em public/. */
export const logoSvg: string | undefined = undefined;

/**
 * Fotos 4:5 em public/socios/. Sem foto, o componente mostra a silhueta.
 * As atuais são de banco de imagem (Unsplash, licença livre) só para a fase
 * de testes; têm "provisorio" no nome e saem quando chegarem as reais.
 */
export const fotosSocios: Record<"samuel" | "malaquias" | "matheus", string | undefined> = {
  samuel: "/socios/samuel-provisorio.webp",
  malaquias: "/socios/malaquias-provisorio.webp",
  matheus: "/socios/matheus-provisorio.webp",
};

/** Vídeo de fundo do hero (mp4 + webm). O provisório tem "provisorio" no nome. */
export const videoHero = {
  src: "/video/fundo/criador-provisorio.mp4",
};

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
    ativo: empresa.cnpj === CNPJ_PROVISORIO,
  },
  {
    id: "logo",
    item: "Logo",
    valorAtual: logoSvg ?? 'Nome "SA Marketing" em texto',
    trocaPor: "public/logo-sa.svg",
    ativo: logoSvg === undefined,
  },
  {
    id: "fotos",
    item: "Fotos dos sócios",
    valorAtual: "Fotos de banco de imagem",
    trocaPor: "Três fotos 4:5 dos sócios",
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
];

export const temProvisorios: boolean = provisorios.some((p) => p.ativo);

/** Etiqueta "Provisório" só aparece em desenvolvimento. */
export const mostrarEtiquetaProvisorio: boolean = process.env.NODE_ENV === "development";
