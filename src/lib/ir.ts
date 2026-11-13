import { DESTINOS_LINK, ORIGENS_LINK, type DestinoLink, type OrigemLink } from "@/content/opcoes";
import { bio, site } from "@/content/site";
import { urlWhatsapp } from "./whatsapp";

/**
 * Para onde vai cada botão da bio. Os botões apontam para /ir/<destino>?de=bio:
 * a rota conta o clique e redireciona. Diagnóstico e site levam os UTMs da
 * bio, que chegam ao banco junto com o lead.
 */

export const ehDestino = (valor: string): valor is DestinoLink => (DESTINOS_LINK as readonly string[]).includes(valor);
export const ehOrigem = (valor: string | null): valor is OrigemLink =>
  valor !== null && (ORIGENS_LINK as readonly string[]).includes(valor);

export function urlDestino(destino: DestinoLink, base: string = site.url): string {
  const utm = new URLSearchParams(bio.utm);
  switch (destino) {
    case "diagnostico":
      return `${base}/?diagnostico&${utm}`;
    case "site":
      return `${base}/?${utm}`;
    case "whatsapp":
      return urlWhatsapp(bio.mensagemWhatsapp);
  }
}

/** Link do botão: passa pela rota que conta o clique. */
export const urlBotao = (destino: DestinoLink, origem: OrigemLink = "bio") => `/ir/${destino}?de=${origem}`;

/** Robôs que abrem o link para gerar a prévia (Instagram, WhatsApp) não contam como clique. */
export const ehRobo = (userAgent: string) =>
  /bot|crawl|spider|facebookexternalhit|meta-externalagent|preview|whatsapp|slurp|headless/i.test(userAgent);
